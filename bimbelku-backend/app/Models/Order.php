<?php

namespace App\Models;

use App\Models\Concerns\HasAutomaticPublicCode;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasAutomaticPublicCode;

    protected $guarded = ['id', 'wallet_reserved_amount', 'wallet_applied_amount', 'wallet_reservation_version', 'payment_provider', 'gateway_creation_uncertain'];

    protected $hidden = ['payment_proof'];

    protected $appends = ['payment_proof_url'];

    protected $casts = [
        'amount' => 'decimal:2',
        'wallet_reserved_amount' => 'decimal:2',
        'wallet_applied_amount' => 'decimal:2',
        'external_received_amount' => 'decimal:2',
        'payment_outstanding_amount' => 'decimal:2',
        'payment_surplus_amount' => 'decimal:2',
        'class_details_snapshot' => 'array',
        'payment_submitted_at' => 'datetime',
        'verified_at' => 'datetime',
        'subtotal_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'top_up_due_at' => 'datetime',
        'gateway_expires_at' => 'datetime',
        'gateway_expected_amount' => 'decimal:2',
        'gateway_last_checked_at' => 'datetime',
        'gateway_creation_uncertain' => 'boolean',
        'gateway_paid_at' => 'datetime',
    ];

    protected function automaticPublicCodeColumn(): string
    {
        return 'order_id';
    }

    protected function buildAutomaticPublicCode(): string
    {
        if ($this->cheap_class_enrollment_id) {
            return 'INV-KM-'.($this->created_at?->format('Ymd') ?? now()->format('Ymd')).'-'.$this->paddedPublicId();
        }

        return 'ORD-'.$this->paddedPublicId();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function legacyBooking()
    {
        return $this->hasOne(Booking::class);
    }

    public function participant()
    {
        return $this->hasOne(BookingParticipant::class);
    }

    public function refund()
    {
        return $this->hasOne(Refund::class);
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class);
    }

    public function learningPackage()
    {
        return $this->belongsTo(LearningPackage::class);
    }

    public function cheapClassEnrollment()
    {
        return $this->belongsTo(CheapClassEnrollment::class);
    }

    public function promotion()
    {
        return $this->belongsTo(Promotion::class);
    }

    public function paymentSubmissions()
    {
        return $this->hasMany(PaymentSubmission::class)->orderBy('sequence');
    }

    public function latestPaymentSubmission()
    {
        return $this->hasOne(PaymentSubmission::class)->latestOfMany();
    }

    public function getPaymentProofUrlAttribute(): ?string
    {
        return $this->payment_proof ? "orders/{$this->id}/payment-proof" : null;
    }
}
