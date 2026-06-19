<?php
namespace App\Models;
use PDO;

final class ReviewModels
{
    public function __construct(private PDO $pdo)
    {
    }

    //to return all the User Review from database
    public function allReview(int $id): array
    {
        $sql = 'SELECT r.*, b.scheduled_at, u.name as learner_name
                FROM Review r
                JOIN Booking b ON r.booking_id = b.id
                JOIN User u ON b.learner_id = u.id
                WHERE b.tutor_ud = :user_id
                ORDER BY r.created_at DESC';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':user_id' => $id]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
