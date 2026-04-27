# Minimizer Task Implementation Plan

## Overview
The Minimizer task is a Jobrunr job that calculates optimal settlements between event participants, minimizing the number of transactions required to settle all debts.

## Current Status
The high-level design is documented in `jobrunr-system-design.md`. This plan focuses on concrete implementation steps.

## Implementation Steps

### Phase 1: Database Schema Updates (Completed in Plan)
1. ✅ Create `settlement` table for storing optimized transactions
2. ✅ Add `version` columns for optimistic locking
3. ✅ Add `participant_ids` JSONB column to `expense` table for expense splitting

### Phase 2: Domain Model Implementation
1. **Create Settlement Domain Model**
   - Extend existing `Settlement.java` domain model
   - Add fields: `id`, `eventId`, `debtorId`, `creditorId`, `amount`, `status`, `calculatedAt`, `completedAt`
   - Add optimistic locking version field

2. **Create Settlement Repository**
   - `SettlementRepository` interface extending `BaseRepository`
   - Methods: `findByEventId`, `findByDebtorId`, `findByCreditorId`, `deleteByEventId`

3. **Create Balance Calculation Service**
   - Service to calculate net balances for each participant
   - Input: List of expenses with participant splits
   - Output: Map<ParticipantId, BigDecimal> (positive = creditor, negative = debtor)

### Phase 3: Minimizer Algorithm Implementation
1. **Algorithm Selection**
   - Use "Minimum Cash Flow" algorithm (also known as "Debt Simplification")
   - Time complexity: O(n log n) where n = number of participants
   - Space complexity: O(n)

2. **Algorithm Implementation Steps**
   ```java
   public class SettlementMinimizer {
       
       public List<SettlementTransaction> minimizeTransactions(Map<Long, BigDecimal> balances) {
           // 1. Separate creditors and debtors
           List<ParticipantBalance> creditors = new ArrayList<>();
           List<ParticipantBalance> debtors = new ArrayList<>();
           
           for (Map.Entry<Long, BigDecimal> entry : balances.entrySet()) {
               if (entry.getValue().compareTo(BigDecimal.ZERO) > 0) {
                   creditors.add(new ParticipantBalance(entry.getKey(), entry.getValue()));
               } else if (entry.getValue().compareTo(BigDecimal.ZERO) < 0) {
                   debtors.add(new ParticipantBalance(entry.getKey(), entry.getValue().abs()));
               }
           }
           
           // 2. Sort both lists (largest amounts first)
           creditors.sort((a, b) -> b.getAmount().compareTo(a.getAmount()));
           debtors.sort((a, b) -> b.getAmount().compareTo(a.getAmount()));
           
           // 3. Greedy algorithm to minimize transactions
           List<SettlementTransaction> transactions = new ArrayList<>();
           int i = 0, j = 0;
           
           while (i < creditors.size() && j < debtors.size()) {
               ParticipantBalance creditor = creditors.get(i);
               ParticipantBalance debtor = debtors.get(j);
               
               BigDecimal minAmount = creditor.getAmount().min(debtor.getAmount());
               
               // Create transaction
               transactions.add(new SettlementTransaction(
                   debtor.getParticipantId(),
                   creditor.getParticipantId(),
                   minAmount
               ));
               
               // Update amounts
               creditor.setAmount(creditor.getAmount().subtract(minAmount));
               debtor.setAmount(debtor.getAmount().subtract(minAmount));
               
               // Remove fully settled participants
               if (creditor.getAmount().compareTo(BigDecimal.ZERO) == 0) i++;
               if (debtor.getAmount().compareTo(BigDecimal.ZERO) == 0) j++;
           }
           
           return transactions;
       }
   }
   ```

### Phase 4: Jobrunr Job Implementation
1. **Create SettlementMinimizerJob**
   ```java
   @Service
   public class SettlementMinimizerJob {
       
       private final ExpenseRepository expenseRepository;
       private final SettlementRepository settlementRepository;
       private final NotificationService notificationService;
       private final SettlementMinimizer minimizer;
       
       @Job(name = "Calculate optimal settlements", retries = 3)
       @Transactional
       public void calculateOptimalSettlements(Long eventId) {
           // 1. Get all expenses for the event
           List<Expense> expenses = expenseRepository.findByEventId(eventId);
           
           // 2. Calculate participant balances
           Map<Long, BigDecimal> balances = calculateBalances(expenses);
           
           // 3. Run minimizer algorithm
           List<SettlementTransaction> transactions = minimizer.minimizeTransactions(balances);
           
           // 4. Save settlements (delete old ones first)
           settlementRepository.deleteByEventId(eventId);
           saveSettlements(eventId, transactions);
           
           // 5. Send notifications
           sendSettlementNotifications(eventId, transactions);
       }
       
       private Map<Long, BigDecimal> calculateBalances(List<Expense> expenses) {
           Map<Long, BigDecimal> balances = new HashMap<>();
           
           for (Expense expense : expenses) {
               // Add to payer's balance (negative - they paid)
               balances.merge(expense.getPaidBy(), expense.getAmount().negate(), BigDecimal::add);
               
               // Split among participants
               List<Long> participantIds = expense.getParticipantIds();
               BigDecimal share = expense.getAmount().divide(
                   BigDecimal.valueOf(participantIds.size()), 2, RoundingMode.HALF_UP);
               
               for (Long participantId : participantIds) {
                   balances.merge(participantId, share, BigDecimal::add);
               }
           }
           
           return balances;
       }
   }
   ```

2. **Job Configuration**
   - Retry policy: 3 retries with exponential backoff
   - Job timeout: 10 minutes
   - Dashboard visibility: Enable in Jobrunr dashboard

### Phase 5: Integration with Data Bus
1. **Event-Driven Triggering**
   ```java
   @Component
   public class ExpenseEventHandler {
       
       private final DataBus dataBus;
       
       @EventListener
       public void handleExpenseCreated(ExpenseCreatedEvent event) {
           // Enqueue minimizer job when expense is created/updated
           dataBus.enqueueJob(
               "settlement-minimizer",
               Map.of("eventId", event.getEventId())
           );
       }
       
       @EventListener  
       public void handleParticipantChanged(ParticipantChangedEvent event) {
           // Also trigger when participants change
           dataBus.enqueueJob(
               "settlement-minimizer", 
               Map.of("eventId", event.getEventId())
           );
       }
   }
   ```

2. **Scheduled Execution**
   ```java
   @Configuration
   public class JobrunrSchedulingConfig {
       
       @Bean
       public JobScheduler jobScheduler(JobRunrStorageProvider storageProvider) {
           return new JobScheduler(storageProvider);
       }
       
       @PostConstruct
       public void scheduleRecurringJobs() {
           // Run minimizer daily at 2 AM for all active events
           BackgroundJob.scheduleRecurringly(
               "daily-settlement-recalculation",
               Cron.daily(2),
               () -> settlementMinimizerJob.recalculateAllActiveEvents()
           );
       }
   }
   ```

### Phase 6: Testing Strategy
1. **Unit Tests**
   - Test minimizer algorithm with various scenarios
   - Test balance calculation logic
   - Test edge cases (zero balances, single participant, etc.)

2. **Integration Tests**
   - Test Jobrunr job execution
   - Test database transactions and optimistic locking
   - Test notification sending

3. **Performance Tests**
   - Test with large events (100+ participants)
   - Measure algorithm execution time
   - Test concurrent job execution

### Phase 7: Monitoring and Observability
1. **Jobrunr Dashboard Integration**
   - Monitor job success/failure rates
   - Track job execution times
   - Set up alerts for failed jobs

2. **Custom Metrics**
   - Number of settlements calculated per event
   - Transaction reduction percentage (before/after optimization)
   - Job execution latency

3. **Logging**
   - Structured logging for job execution
   - Audit logs for settlement calculations
   - Error logging with context

## Dependencies
1. **Jobrunr Spring Boot Starter** - Already added to pom.xml
2. **PostgreSQL** - For Jobrunr job storage
3. **Spring Transaction Management** - For atomic operations
4. **Testing Dependencies** - JUnit, Mockito, Testcontainers

## Risk Mitigation
1. **Data Consistency**
   - Use optimistic locking to prevent conflicts
   - Implement idempotent job execution
   - Add database constraints for data integrity

2. **Performance**
   - Add database indexes for balance calculations
   - Implement pagination for large events
   - Consider caching for frequent calculations

3. **Error Handling**
   - Implement comprehensive retry logic
   - Add dead letter queue for failed jobs
   - Notify administrators of critical failures

## Success Metrics
1. **Functional**
   - Correct settlement calculations for all test cases
   - Successful job execution in production
   - Proper notification delivery

2. **Performance**
   - < 1 second calculation time for events with < 50 participants
   - < 5 seconds calculation time for events with < 200 participants
   - 99.9% job success rate

3. **Business**
   - Reduced number of transactions by 50-80% (typical for minimizer algorithm)
   - Improved user satisfaction with simplified settlements
   - Reduced support tickets related to settlement confusion

## Timeline
- Phase 1-2: 2 days
- Phase 3-4: 3 days  
- Phase 5: 2 days
- Phase 6: 3 days
- Phase 7: 1 day
- **Total: 11 working days**

## Next Steps
1. Review this plan with the development team
2. Begin implementation with Phase 1
3. Schedule regular check-ins to track progress
4. Plan for incremental rollout to production