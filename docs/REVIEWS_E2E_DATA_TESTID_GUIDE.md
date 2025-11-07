# Guide data-testid pour le système de Reviews

## Vue d'ensemble

Ce document liste tous les attributs `data-testid` qui doivent être ajoutés aux composants du système de reviews pour supporter les tests E2E.

## Priorité d'implémentation

### 🔴 Critique (Requis pour les tests de base)
- ReviewForm
- ReviewCard
- ReviewsList
- ReviewStatsCard

### 🟡 Important (Requis pour tests avancés)
- PhotoUpload / PhotoGallery
- ModerationQueue
- ReviewModerationForm
- Review filters

### 🟢 Optionnel (Nice to have)
- Badges
- Detailed ratings
- Response dialog

---

## 1. ReviewForm Component
**Fichier:** `src/features/reviews/components/review-form.tsx`

```tsx
<form data-testid="review-form">
  {/* Star Rating */}
  <div data-testid="star-rating">
    <button data-testid="star-rating-1">★</button>
    <button data-testid="star-rating-2">★</button>
    <button data-testid="star-rating-3">★</button>
    <button data-testid="star-rating-4">★</button>
    <button data-testid="star-rating-5">★</button>
  </div>

  {/* Comment Textarea */}
  <textarea data-testid="review-comment" />

  {/* Detailed Ratings (optional) */}
  <div data-testid="detailed-ratings">
    <div data-testid="detailed-rating-communication">
      <button data-testid="detailed-rating-communication-1">1</button>
      {/* ... jusqu'à 5 */}
    </div>
    {/* Répéter pour quality, professionalism, timeliness, valueForMoney */}
  </div>

  {/* Photo Upload */}
  <input type="file" data-testid="photo-upload-input" />
  <div data-testid="photo-preview-{index}" />

  {/* Submit Button */}
  <button type="submit" data-testid="submit-review-button">
    Publier l'avis
  </button>
</form>
```

---

## 2. ReviewCard Component
**Fichier:** `src/features/reviews/components/review-card.tsx`

```tsx
<div 
  data-testid="review-card"
  data-review-id={review.id}
>
  {/* Rating Display */}
  <div data-testid="review-rating">{review.rating}.0</div>

  {/* Comment */}
  <p data-testid="review-comment">{review.comment}</p>

  {/* Photo Gallery */}
  {review.photos && (
    <div data-testid="photo-gallery">
      {review.photos.map((photo, index) => (
        <img 
          key={index}
          data-testid={`photo-preview-${index}`}
          src={photo}
        />
      ))}
    </div>
  )}

  {/* Provider Response */}
  {review.response && (
    <div data-testid="review-response">
      {review.response.text}
    </div>
  )}

  {/* Actions */}
  <div data-testid="review-actions">
    {/* Helpful Button */}
    <button data-testid={`helpful-button-${review.id}`}>
      Utile ({helpfulCount})
    </button>
    <span data-testid={`helpful-count-${review.id}`}>
      {review.helpfulCount || 0}
    </span>

    {/* Report Button */}
    <button data-testid={`report-button-${review.id}`}>
      Signaler
    </button>

    {/* Respond Button (providers only) */}
    {canRespond && (
      <button data-testid={`respond-button-${review.id}`}>
        Répondre
      </button>
    )}
  </div>

  {/* Badges */}
  {review.verified && (
    <span data-testid={`review-badge-verified-${review.id}`}>✓</span>
  )}
</div>
```

---

## 3. ReviewsList Component
**Fichier:** `src/features/reviews/components/reviews-list.tsx`

```tsx
<div data-testid="reviews-list">
  {/* Loading State */}
  {loading && (
    <div data-testid="reviews-loading">Chargement...</div>
  )}

  {/* Empty State */}
  {reviews.length === 0 && !loading && (
    <div data-testid="reviews-empty">Aucun avis</div>
  )}

  {/* Reviews */}
  {reviews.map(review => (
    <ReviewCard key={review.id} review={review} />
  ))}
</div>
```

---

## 4. ReviewStatsCard Component
**Fichier:** `src/features/reviews/components/review-stats-card.tsx`

```tsx
<div data-testid="review-stats-card">
  {/* Total Reviews */}
  <div data-testid="review-stats-total">
    {stats.totalReviews} avis
  </div>

  {/* Average Rating */}
  <div data-testid="review-stats-average">
    {stats.averageRating.toFixed(1)} / 5
  </div>

  {/* Rating Distribution */}
  <div data-testid="rating-distribution">
    {[5, 4, 3, 2, 1].map(rating => (
      <div key={rating} data-testid={`rating-bar-${rating}`}>
        {stats.ratingDistribution[rating]}
      </div>
    ))}
  </div>

  {/* Response Rate (providers only) */}
  {stats.responseRate !== undefined && (
    <div data-testid="response-rate">
      {stats.responseRate}%
    </div>
  )}

  {/* Detailed Averages */}
  {stats.detailedAverages && (
    <div data-testid="detailed-averages">
      <div data-testid="detailed-rating-communication">
        {stats.detailedAverages.communication}
      </div>
      <div data-testid="detailed-rating-quality">
        {stats.detailedAverages.quality}
      </div>
      <div data-testid="detailed-rating-professionalism">
        {stats.detailedAverages.professionalism}
      </div>
      <div data-testid="detailed-rating-timeliness">
        {stats.detailedAverages.timeliness}
      </div>
      <div data-testid="detailed-rating-valueForMoney">
        {stats.detailedAverages.valueForMoney}
      </div>
    </div>
  )}

  {/* Quality Badges */}
  {stats.badges?.map(badge => (
    <span 
      key={badge.type}
      data-testid={`quality-badge-${badge.type}`}
    >
      {badge.type}
    </span>
  ))}
</div>
```

---

## 5. Pages - Reviews Dashboard
**Fichier:** `src/app/[locale]/dashboard/reviews/page.tsx`

```tsx
<div data-testid="reviews-page">
  {/* Tabs */}
  <div data-testid="reviews-tabs">
    <button data-testid="reviews-tab-received">Reçus</button>
    <button data-testid="reviews-tab-given">Donnés</button>
  </div>

  {/* Stats Card */}
  <ReviewStatsCard stats={stats} />

  {/* Reviews List */}
  <ReviewsList reviews={reviews} />
</div>
```

---

## 6. Pages - Profile
**Fichier:** `src/app/[locale]/profile/[userId]/page.tsx`

```tsx
<div data-testid="profile-page">
  {/* User Info */}
  <div data-testid="user-profile-header">
    {/* ... */}
  </div>

  {/* Reviews Section */}
  <section data-testid="profile-reviews-section">
    <ReviewStatsCard stats={reviewStats} />
    <ReviewsList reviews={reviews} />
  </section>
</div>
```

---

## 7. ModerationQueue Component
**Fichier:** `src/features/reviews/admin/moderation-queue.tsx`

```tsx
<div data-testid="moderation-page">
  {/* Stats Dashboard */}
  <div data-testid="moderation-stats">
    <div data-testid="pending-reports-count">
      {stats.pendingReports}
    </div>
    <div data-testid="total-reports-count">
      {stats.totalReports}
    </div>
  </div>

  {/* Filter Tabs */}
  <div data-testid="moderation-filters">
    <button data-testid="filter-pending">En attente</button>
    <button data-testid="filter-approved">Approuvés</button>
    <button data-testid="filter-removed">Supprimés</button>
    <button data-testid="filter-dismissed">Rejetés</button>
  </div>

  {/* Queue */}
  <div data-testid="moderation-queue">
    {reports.map(review => (
      <div 
        key={review.id}
        data-testid={`moderation-review-${review.id}`}
      >
        {/* Review Content */}
        <ReviewCard review={review} />

        {/* Moderation Actions */}
        <div data-testid="moderation-actions">
          <button data-testid={`moderate-approve-${review.id}`}>
            Approuver
          </button>
          <button data-testid={`moderate-remove-${review.id}`}>
            Supprimer
          </button>
          <button data-testid={`moderate-dismiss-${review.id}`}>
            Rejeter le signalement
          </button>
        </div>

        {/* Status Badge */}
        <span data-testid={`status-${review.moderation.status}`}>
          {review.moderation.status}
        </span>
      </div>
    ))}
  </div>
</div>
```

---

## 8. ReviewModerationForm Component
**Fichier:** `src/features/reviews/admin/review-moderation-form.tsx`

```tsx
<form data-testid="moderation-form">
  {/* Action Type */}
  <select data-testid="moderation-action">
    <option value="approve">Approuver</option>
    <option value="remove">Supprimer</option>
    <option value="dismiss">Rejeter</option>
  </select>

  {/* Reason (for remove) */}
  <textarea data-testid="moderation-reason" />

  {/* Note (for approve/dismiss) */}
  <textarea data-testid="moderation-note" />

  {/* Submit */}
  <button type="submit" data-testid="confirm-moderation-button">
    Confirmer
  </button>
</form>
```

---

## 9. Report Dialog
**Fichier:** `src/features/reviews/components/report-dialog.tsx`

```tsx
<Dialog data-testid="report-dialog">
  <DialogTitle data-testid="report-dialog-title">
    Signaler cet avis
  </DialogTitle>

  <form data-testid="report-form">
    {/* Reasons */}
    <div data-testid="report-reasons">
      <button data-testid="report-reason-inappropriate">
        Contenu inapproprié
      </button>
      <button data-testid="report-reason-spam">
        Spam
      </button>
      <button data-testid="report-reason-fake">
        Faux avis
      </button>
      <button data-testid="report-reason-offensive">
        Contenu offensant
      </button>
      <button data-testid="report-reason-other">
        Autre
      </button>
    </div>

    <button type="submit" data-testid="submit-report-button">
      Envoyer le signalement
    </button>
  </form>
</Dialog>
```

---

## 10. Response Dialog
**Fichier:** `src/features/reviews/components/response-dialog.tsx`

```tsx
<Dialog data-testid="response-dialog">
  <DialogTitle data-testid="response-dialog-title">
    Répondre à l'avis
  </DialogTitle>

  <form data-testid="response-form">
    <textarea data-testid="response-text" />

    <button type="submit" data-testid="submit-response-button">
      Publier la réponse
    </button>
  </form>
</Dialog>
```

---

## 11. Review Filters
**Fichier:** `src/features/reviews/components/review-filters.tsx`

```tsx
<div data-testid="review-filters">
  {/* Rating Filter */}
  <div data-testid="filter-by-rating">
    <button data-testid="filter-rating-1">1★</button>
    <button data-testid="filter-rating-2">2★</button>
    <button data-testid="filter-rating-3">3★</button>
    <button data-testid="filter-rating-4">4★</button>
    <button data-testid="filter-rating-5">5★</button>
  </div>

  {/* Sort Options */}
  <select data-testid="sort-by">
    <option value="recent" data-testid="sort-option-recent">
      Plus récents
    </option>
    <option value="highest" data-testid="sort-option-highest">
      Meilleures notes
    </option>
    <option value="lowest" data-testid="sort-option-lowest">
      Notes les plus basses
    </option>
    <option value="helpful" data-testid="sort-option-helpful">
      Plus utiles
    </option>
  </select>

  {/* Boolean Filters */}
  <label>
    <input type="checkbox" data-testid="filter-has-photos" />
    Avec photos
  </label>

  <label>
    <input type="checkbox" data-testid="filter-has-response" />
    Avec réponse
  </label>

  {/* Apply Button */}
  <button data-testid="apply-filters-button">
    Appliquer
  </button>
</div>
```

---

## 12. Toast Notifications

Pour les tests, il est important d'avoir des `data-testid` sur les toasts :

```tsx
// Success toast
<Toast data-testid="success-toast">
  {message}
</Toast>

// Error toast
<Toast data-testid="error-toast">
  {message}
</Toast>

// Auth required
<Toast data-testid="auth-required-toast">
  Veuillez vous connecter
</Toast>
```

---

## 13. Already Reviewed Message
**Fichier:** `src/components/booking-detail-content.tsx`

```tsx
{alreadyReviewed && (
  <div data-testid="already-reviewed-message">
    Vous avez déjà évalué cette prestation
  </div>
)}
```

---

## Checklist d'implémentation

### Phase 1 - Composants de base ✅
- [ ] ReviewForm (`review-form.tsx`)
- [ ] ReviewCard (`review-card.tsx`)
- [ ] ReviewsList (`reviews-list.tsx`)
- [ ] ReviewStatsCard (`review-stats-card.tsx`)

### Phase 2 - Pages ✅
- [ ] Dashboard Reviews (`/dashboard/reviews/page.tsx`)
- [ ] Profile (`/profile/[userId]/page.tsx`)
- [ ] Booking Detail (`booking-detail-content.tsx`)

### Phase 3 - Admin ✅
- [ ] ModerationQueue (`moderation-queue.tsx`)
- [ ] ReviewModerationForm (`review-moderation-form.tsx`)
- [ ] Moderation Page (`/dashboard/admin/moderation/reports/page.tsx`)

### Phase 4 - Dialogs & Filters ✅
- [ ] Report Dialog
- [ ] Response Dialog
- [ ] Review Filters

### Phase 5 - Toast & Messages ✅
- [ ] Success/Error toasts
- [ ] Auth required messages
- [ ] Already reviewed message

---

## Notes d'implémentation

### Naming Convention
- **Pages:** `{feature}-page`
- **Components:** `{component-name}`
- **Buttons:** `{action}-button` ou `{action}-button-{id}`
- **Inputs:** `{field-name}-input`
- **Forms:** `{feature}-form`
- **Dialogs:** `{feature}-dialog`
- **Stats:** `{stat-name}-count` ou `{stat-name}-rate`

### Dynamic IDs
Pour les éléments répétés (reviews, buttons, etc.), utiliser l'ID de l'entité :
```tsx
data-testid={`helpful-button-${review.id}`}
data-testid={`moderation-review-${review.id}`}
```

### Loading States
```tsx
{loading && <div data-testid="{feature}-loading">...</div>}
```

### Empty States
```tsx
{items.length === 0 && <div data-testid="{feature}-empty">...</div>}
```

---

## Exécution des tests

```bash
# Tous les tests reviews
pnpm test:e2e e2e/reviews-system.spec.ts

# Test spécifique
pnpm test:e2e e2e/reviews-system.spec.ts -g "should create a basic review"

# Mode UI (debug)
pnpm test:e2e:ui e2e/reviews-system.spec.ts
```

---

## Prochaines étapes

1. ✅ Ajouter tous les `data-testid` listés ci-dessus
2. ✅ Créer les fixtures de données de test dans Firestore
3. ✅ Configurer les utilisateurs de test (client, provider, admin)
4. ✅ Exécuter les tests en mode headless
5. ✅ Ajouter des screenshots en cas d'échec
6. ✅ Intégrer dans CI/CD pipeline

---

**Dernière mise à jour:** 7 novembre 2025  
**Status:** Phase 1 - Tests E2E créés, en attente d'implémentation des data-testid
