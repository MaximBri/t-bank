# Jobrunr Notification Cleanup Documentation

## Overview
This document describes how Jobrunr is used to automatically clean up old notifications in the T-Event application. The system implements a scheduled cleanup job that removes expired notifications to maintain database performance and comply with data retention policies.

## Database Schema for Notifications

### Notification Table Structure
```sql
CREATE TABLE notification (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('INFO', 'WARNING', 'ERROR', 'INVITATION', 'EXPENSE', 'SETTLEMENT')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,  -- When notification should be cleaned up
    metadata JSONB,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    version INTEGER NOT NULL DEFAULT 0
);

-- Indexes for efficient cleanup queries
CREATE INDEX idx_notification_expires_at ON notification(expires_at) WHERE is_read = TRUE;
CREATE INDEX idx_notification_user_created ON notification(user_id, created_at DESC);
```

## Cleanup Strategy

### Retention Policies
1. **Read Notifications**: Delete 30 days after being read
2. **Unread Notifications**: Keep indefinitely until manually deleted
3. **Expired Notifications**: Delete immediately after expiry date
4. **System Notifications**: Keep for 90 days regardless of read status

### Cleanup Job Implementation

#### 1. Notification Cleanup Job
```java
@Service
public class NotificationCleanupJob {
    
    private final NotificationRepository notificationRepository;
    private final Logger logger = LoggerFactory.getLogger(NotificationCleanupJob.class);
    
    /**
     * Main cleanup job that runs daily
     * Deletes notifications that match cleanup criteria
     */
    @Job(name = "Cleanup expired notifications", retries = 2)
    @Transactional
    public void cleanupExpiredNotifications() {
        Instant cutoffDate = Instant.now().minus(30, ChronoUnit.DAYS);
        
        // Delete read notifications older than 30 days
        int deletedRead = notificationRepository.deleteReadNotificationsOlderThan(cutoffDate);
        
        // Delete expired notifications (past expires_at)
        int deletedExpired = notificationRepository.deleteExpiredNotifications(Instant.now());
        
        // Delete system notifications older than 90 days
        Instant systemCutoff = Instant.now().minus(90, ChronoUnit.DAYS);
        int deletedSystem = notificationRepository.deleteSystemNotificationsOlderThan(systemCutoff);
        
        logger.info("Notification cleanup completed: {} read, {} expired, {} system notifications deleted",
            deletedRead, deletedExpired, deletedSystem);
    }
    
    /**
     * Emergency cleanup for specific user (e.g., GDPR right to be forgotten)
     */
    @Job(name = "Cleanup user notifications", retries = 3)
    @Transactional
    public void cleanupUserNotifications(Long userId) {
        int deletedCount = notificationRepository.deleteByUserId(userId);
        logger.info("Deleted {} notifications for user {}", deletedCount, userId);
    }
}
```

#### 2. Repository Methods
```java
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.isRead = true AND n.readAt < :cutoffDate")
    int deleteReadNotificationsOlderThan(@Param("cutoffDate") Instant cutoffDate);
    
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.expiresAt < :currentTime")
    int deleteExpiredNotifications(@Param("currentTime") Instant currentTime);
    
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.type = 'SYSTEM' AND n.createdAt < :cutoffDate")
    int deleteSystemNotificationsOlderThan(@Param("cutoffDate") Instant cutoffDate);
    
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.userId = :userId")
    int deleteByUserId(@Param("userId") Long userId);
}
```

## Jobrunr Configuration

### 1. Scheduled Cleanup Jobs
```java
@Configuration
public class NotificationCleanupScheduler {
    
    private final JobScheduler jobScheduler;
    private final NotificationCleanupJob cleanupJob;
    
    public NotificationCleanupScheduler(JobScheduler jobScheduler, NotificationCleanupJob cleanupJob) {
        this.jobScheduler = jobScheduler;
        this.cleanupJob = cleanupJob;
    }
    
    @PostConstruct
    public void scheduleCleanupJobs() {
        // Daily cleanup at 3:00 AM
        jobScheduler.scheduleRecurringly(
            "daily-notification-cleanup",
            Cron.daily(3),
            () -> cleanupJob.cleanupExpiredNotifications()
        );
        
        // Weekly deep cleanup on Sunday at 4:00 AM
        jobScheduler.scheduleRecurringly(
            "weekly-deep-cleanup",
            Cron.weekly(0, 4),  // Sunday 4:00 AM
            () -> cleanupJob.deepCleanup()
        );
    }
}
```

### 2. Jobrunr Dashboard Integration
The cleanup jobs are visible in the Jobrunr dashboard at `/jobrunr/dashboard`:
- **Status monitoring**: Success/failure rates
- **Execution history**: Past runs and performance metrics
- **Manual triggering**: Ability to run cleanup jobs manually
- **Error handling**: View failed jobs and retry them

## Integration with Data Bus

### 1. Event-Driven Cleanup Triggers
```java
@Component
public class NotificationCleanupEventHandler {
    
    private final DataBus dataBus;
    
    @EventListener
    public void handleUserDeleted(UserDeletedEvent event) {
        // Schedule immediate cleanup of user notifications
        dataBus.enqueueJob(
            "notification-cleanup-user",
            Map.of("userId", event.getUserId())
        );
    }
    
    @EventListener
    public void handleStorageLow(StorageLowEvent event) {
        // Emergency cleanup when storage is low
        dataBus.enqueueJob(
            "emergency-notification-cleanup",
            Map.of("aggressive", true)
        );
    }
}
```

### 2. Data Bus Job Handler
```java
@Component
public class NotificationCleanupJobHandler implements JobHandler {
    
    private final NotificationCleanupJob cleanupJob;
    
    @Override
    public String getJobName() {
        return "notification-cleanup";
    }
    
    @Override
    public void handleJob(Map<String, Object> parameters) {
        if (parameters.containsKey("userId")) {
            Long userId = ((Number) parameters.get("userId")).longValue();
            cleanupJob.cleanupUserNotifications(userId);
        } else if (Boolean.TRUE.equals(parameters.get("aggressive"))) {
            // Aggressive cleanup - delete all notifications older than 7 days
            cleanupJob.aggressiveCleanup();
        } else {
            cleanupJob.cleanupExpiredNotifications();
        }
    }
}
```

## Performance Considerations

### 1. Batch Processing
```java
@Service
public class BatchNotificationCleanupJob {
    
    @Job(name = "Batch notification cleanup", retries = 2)
    @Transactional
    public void batchCleanup() {
        int batchSize = 1000;
        int totalDeleted = 0;
        
        do {
            // Delete in batches to avoid long-running transactions
            int deleted = notificationRepository.deleteBatch(batchSize);
            totalDeleted += deleted;
            
            if (deleted > 0) {
                // Small pause between batches
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        } while (deleted == batchSize);
        
        logger.info("Batch cleanup completed: {} notifications deleted", totalDeleted);
    }
}
```

### 2. Database Index Optimization
- **Composite index** on `(is_read, read_at)` for efficient read notification cleanup
- **Partial index** on `expires_at` for expired notification queries
- **Partitioning** by `created_at` for large-scale deployments

## Monitoring and Alerting

### 1. Metrics Collection
```java
@Component
public class NotificationCleanupMetrics {
    
    private final MeterRegistry meterRegistry;
    
    public void recordCleanupMetrics(int deletedCount, Duration duration, String cleanupType) {
        // Record metrics for monitoring
        meterRegistry.counter("notification.cleanup.count", "type", cleanupType)
            .increment(deletedCount);
        
        meterRegistry.timer("notification.cleanup.duration", "type", cleanupType)
            .record(duration);
    }
    
    public void recordCleanupError(String errorType) {
        meterRegistry.counter("notification.cleanup.errors", "type", errorType)
            .increment();
    }
}
```

### 2. Alert Configuration
- **Alert**: Cleanup job failure rate > 10%
- **Alert**: Cleanup duration > 5 minutes
- **Alert**: No cleanup jobs executed in 24 hours
- **Alert**: Database growth rate abnormal

## Testing Strategy

### 1. Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class NotificationCleanupJobTest {
    
    @Mock
    private NotificationRepository notificationRepository;
    
    @InjectMocks
    private NotificationCleanupJob cleanupJob;
    
    @Test
    void testCleanupExpiredNotifications() {
        // Given
        when(notificationRepository.deleteExpiredNotifications(any()))
            .thenReturn(10);
        
        // When
        cleanupJob.cleanupExpiredNotifications();
        
        // Then
        verify(notificationRepository).deleteExpiredNotifications(any());
    }
}
```

### 2. Integration Tests
```java
@SpringBootTest
@Testcontainers
class NotificationCleanupIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");
    
    @Test
    void testScheduledCleanup() {
        // Test that scheduled job runs correctly
    }
}
```

## Deployment Considerations

### 1. Environment-Specific Configuration
```yaml
# application-production.yaml
jobrunr:
  notifications:
    cleanup:
      schedule: "0 0 3 * * *"  # Daily at 3 AM
      retention-days: 30
      batch-size: 1000
      enabled: true

# application-development.yaml  
jobrunr:
  notifications:
    cleanup:
      schedule: "0 */2 * * * *"  # Every 2 hours for testing
      retention-days: 7
      batch-size: 100
      enabled: true
```

### 2. Rollback Strategy
1. **Feature flag**: Enable/disable cleanup via configuration
2. **Dry run mode**: Log what would be deleted without actually deleting
3. **Backup before cleanup**: Optional backup of notifications before deletion
4. **Gradual rollout**: Start with small retention period, increase gradually

## Maintenance Procedures

### 1. Manual Cleanup Commands
```bash
# Trigger immediate cleanup
curl -X POST http://localhost:8080/api/admin/jobs/notification-cleanup/trigger

# Check cleanup status
curl http://localhost:8080/api/admin/jobs/notification-cleanup/status

# View cleanup statistics
curl http://localhost:8080/api/admin/jobs/notification-cleanup/stats
```

### 2. Emergency Procedures
1. **Stop all cleanup jobs**: Disable in configuration
2. **Restore from backup**: If accidental deletion occurs
3. **Investigate issues**: Check Jobrunr dashboard and logs
4. **Gradual restart**: Re-enable with increased monitoring

## Success Metrics
1. **Database size**: Maintain notification table under 1GB
2. **Query performance**: Notification queries < 100ms p95
3. **Job success rate**: > 99.9% cleanup job success
4. **User impact**: Zero user complaints about missing notifications
5. **System performance**: Cleanup jobs complete in < 5 minutes

## Conclusion
The Jobrunr notification cleanup system provides a robust, scalable solution for managing notification lifecycle in T-Event. By leveraging Jobrunr's scheduling capabilities, transactional support, and monitoring features, we ensure efficient cleanup while maintaining system performance and data integrity.