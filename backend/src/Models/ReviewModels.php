<?php

namespace App\Models;

use PDO;

class ReviewModels
{
    public function __construct(private PDO $pdo) {}

    public function create(array $data): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO "Review" (booking_id, rating, comment, created_at) VALUES (?, ?, ?, NOW()) RETURNING id'
        );
        $stmt->execute([
            $data['booking_id'],
            $data['rating'],
            $data['comment'] ?? '',
        ]);
        $row = $stmt->fetch();
        return (int) $row['id'];
    }

    public function findByTutor(int $tutorId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT r.*, b.skill_id, s.name AS skill_name, u.name AS reviewer_name
               FROM "Review" r
               JOIN "Booking" b ON b.id = r.booking_id
               JOIN "Skill"   s ON s.id = b.skill_id
               JOIN "User"    u ON u.id = b.learner_id
              WHERE b.tutor_id = ?
              ORDER BY r.created_at DESC'
        );
        $stmt->execute([$tutorId]);
        return $stmt->fetchAll();
    }

    public function findByBooking(int $bookingId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM "Review" WHERE booking_id = ? LIMIT 1');
        $stmt->execute([$bookingId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getAverageRating(int $tutorId): float
    {
        $stmt = $this->pdo->prepare(
            'SELECT AVG(r.rating) AS avg_rating
               FROM "Review" r
               JOIN "Booking" b ON b.id = r.booking_id
              WHERE b.tutor_id = ?'
        );
        $stmt->execute([$tutorId]);
        $row = $stmt->fetch();
        return round((float)($row['avg_rating'] ?? 0), 1);
    }
}
