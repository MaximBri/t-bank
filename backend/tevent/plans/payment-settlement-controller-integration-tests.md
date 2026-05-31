# Integration Tests Plan: PaymentController & SettlementController

## Real Data Flow

Payments создаются через `EventCompletionService.completeEvent()`:
1. Создать событие (POST /events) — owner = user1
2. Добавить участников user2, user3 в событие (через EventUserRepository)
3. Создать Expense (POST /events/{eventId}/expenses) от user1 с participantIds = [user2, user3]
4. Подтвердить splits: POST /expenses/participant/{expenseId}/confirm от user2 и user3
5. Когда все splits подтверждены → expense.status = "ACTIVE"
6. Завершить событие: POST /events/{eventId}/complete от user1
7. `EventCompletionService` → `DebtCalculator.calculateOptimalDebts()` → создает Payment записи
8. Теперь можно тестировать PaymentController (markAsSent, markAsFailed, markAsComplete)
9. И SettlementController (GET /events/{eventId}/settlements)

## Controllers

### PaymentController — 3 endpoints
`POST /events/{eventId}/payments/{paymentId}/sent|fail|complete`

| Endpoint | Success | Errors |
|----------|---------|--------|
| `/sent` | 200 | 401, 403 (not debtor), 409 (not ACTIVE), 400 (not found) |
| `/fail` | 200 | 401, 403 (not recipient), 409 (not SENT), 400 (not found) |
| `/complete` | 200 | 401, 403 (not recipient), 409 (not SENT), 400 (not found) |

### SettlementController — 1 endpoint
`GET /events/{eventId}/settlements` → 200 | 401, 403, 400 (not COMPLETED)

## Exception Mapping

| Exception | HTTP | Source |
|-----------|------|--------|
| `AccessDeniedException` | 403 | not debtor/recipient, not member |
| `IllegalStateException` | 409 | wrong payment status |
| `IllegalArgumentException` | 400 | payment not found, event not completed |
| `AuthenticationException` | 401 | no auth |

## Users: 3 users per test

- **User1** (owner) — creates event, creates expense (payer), completes event
- **User2** (participant) — confirms split, is the debtor/creditor in payments
- **User3** (participant) — confirms split, extra participant for expense splits

## Test Scenarios

### PaymentController — `POST /events/{eventId}/payments/{paymentId}/sent`

1. **shouldMarkAsSentSuccessfully** — Complete event → get payments → call markAsSent as debtor (fromUserId) → 200, verify status=SENT
2. **shouldReturn403WhenNotDebtor** — Call markAsSent as user2 (not fromUserId) → 403
3. **shouldReturn409WhenPaymentNotActive** — First markAsSent (→ SENT), then markAsSent again → 409
4. **shouldReturn400WhenPaymentNotFound** — Random paymentId → 400
5. **shouldReturn401WhenNotAuthenticated** — No cookie → 401

### PaymentController — `POST /events/{eventId}/payments/{paymentId}/fail`

6. **shouldMarkAsFailedSuccessfully** — MarkAsSent first → then markAsFailed as recipient (toUserId) → 200, verify status=FAILED
7. **shouldReturn403WhenNotRecipient** — Payment SENT, call as user1 (not toUserId) → 403
8. **shouldReturn409WhenPaymentNotSent** — Payment ACTIVE, call markAsFailed → 409
9. **shouldReturn400WhenPaymentNotFound** — Random paymentId → 400
10. **shouldReturn401WhenNotAuthenticated** — No cookie → 401

### PaymentController — `POST /events/{eventId}/payments/{paymentId}/complete`

11. **shouldMarkAsCompleteSuccessfully** — MarkAsSent → markAsComplete as recipient → 200, verify status=COMPLETED, confirmedAt not null
12. **shouldReturn403WhenNotRecipient** — Payment SENT, call as user1 → 403
13. **shouldReturn409WhenPaymentNotSent** — Payment ACTIVE, call markAsComplete → 409
14. **shouldReturn400WhenPaymentNotFound** — Random paymentId → 400
15. **shouldReturn401WhenNotAuthenticated** — No cookie → 401

### SettlementController — `GET /events/{eventId}/settlements`

16. **shouldGetSettlementsSuccessfully** — Complete event with expenses → 200, verify response has settlements with payment data
17. **shouldReturn400WhenEventNotCompleted** — Event not completed → 400
18. **shouldReturn403WhenNotMember** — Call as user who is not a participant → 403
19. **shouldReturn401WhenNotAuthenticated** — No cookie → 401
20. **shouldReturnEmptySettlementsWhenNoExpenses** — Complete event with no expenses → 200, empty settlements list

## Test File Structure

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class PaymentSettlementControllerIntegrationTest {

    @Autowired private TestRestTemplate restTemplate;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private EventRepository eventRepository;
    @Autowired private EventUserRepository eventUserRepository;
    @Autowired private ExpenseRepository expenseRepository;
    @Autowired private ExpenseSplitRepository expenseSplitRepository;
    @Autowired private InviteTokenRepository inviteTokenRepository;
    @Autowired private CategoryEventRepository categoryEventRepository;
    @Autowired private InvitationRepository invitationRepository;

    @MockitoBean private S3Service s3Service;

    private String token1, token2, token3;
    private UUID userId1, userId2, userId3;

    @BeforeEach
    void setUp() {
        doNothing().when(s3Service).useKey(anyString());
        // register 3 users with UUID-based logins
    }

    @AfterEach
    void tearDown() {
        expenseSplitRepository.deleteAll();
        expenseRepository.deleteAll();
        paymentRepository.deleteAll();
        categoryEventRepository.deleteAll();
        eventUserRepository.deleteAll();
        invitationRepository.deleteAll();
        eventRepository.deleteAll();
        inviteTokenRepository.deleteAll();
    }

    // Helpers
    private record UserRegistration(String accessToken, UUID userId) {}
    private UserRegistration registerUserAndGetId(String login, String password) { ... }
    private String extractCookieValue(List<String> cookies, String cookieName) { ... }
    private HttpHeaders createAuthHeaders(String token) { ... }
    private EventRequest createValidEventRequest() { ... }
    private UUID createEvent(String token) { ... }
    private UUID createExpense(String token, UUID eventId, List<UUID> participantIds) { ... }
    private void confirmSplit(String token, UUID expenseId) { ... }
    private UUID completeEvent(String token, UUID eventId) { ... }

    @Nested class MarkAsSentTests { ... }
    @Nested class MarkAsFailedTests { ... }
    @Nested class MarkAsCompleteTests { ... }
    @Nested class GetSettlementsTests { ... }
}
```

## Complete Test Setup Flow (for PaymentController tests)

```
1. registerUserAndGetId("user-<uuid>", "pass") → token1, userId1  (owner)
2. registerUserAndGetId("user-<uuid>", "pass") → token2, userId2  (participant)
3. registerUserAndGetId("user-<uuid>", "pass") → token3, userId3  (participant)
4. createEvent(token1) → eventId
5. Add user2, user3 as participants via eventUserRepository.save()
6. createExpense(token1, eventId, [userId2, userId3]) → expenseId
   (Expense created with status PENDING, splits created for user2, user3)
7. confirmSplit(token2, expenseId) → user2 confirms their split
8. confirmSplit(token3, expenseId) → user3 confirms their split
   (All splits confirmed → expense becomes ACTIVE)
9. completeEvent(token1, eventId) → DebtCalculator creates Payment records
10. Fetch payments from paymentRepository.findAllByEventId(eventId)
11. Now test PaymentController endpoints with the created payments
```

## Cleanup Order (FK dependencies)

```
expense_split → expense → payment → category_event → event_user → event_invitation → event → invite_token
```

## Key Risks

1. **`ExpenseCommandService.create()`** calls `s3Service.useKey()` if imageKey is not blank — our mock handles this with `doNothing().when(s3Service).useKey(anyString())`
2. **`ExpenseCommandService.create()`** calls `splitService.createEqualSplits()` which requires participantIds — we provide [userId2, userId3]
3. **`ExpenseCommandService.create()`** calls `categoryCommandService.syncCategories()` — if categories list is null/empty, it should be a no-op
4. **`ExpenseSplitService.confirm()`** checks `event.state != "COMPLETED"` — our event is not completed yet, so fine
5. **`Expense.activate()`** sets status to "ACTIVE" — this happens automatically when all splits are confirmed
6. **`EventCompletionService.completeEvent()`** checks `event.getOwnerId().equals(currentUserId)` — only owner can complete
7. **`DebtCalculator.calculateOptimalDebts()`** queries `expenseSplitRepository.findNetBalancesByEventId()` — needs ACTIVE expenses with confirmed splits
8. **`SettlementQueryService.getEventSettlements()`** reads `paymentRepository.findAllByEventId()` — returns whatever payments exist