<?php

namespace App\Models;

use PDO;

class UserModels
{
    public function __construct(private PDO $pdo) {}

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM "User" WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function find(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM "User" WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function createUser(
        string $name,
        string $email,
        string $passwordHash,
        string $faculty = '',
        string $role    = 'tutee',
        string $bio     = ''
    ): int {
        $stmt = $this->pdo->prepare(
            'INSERT INTO "User" (name, email, password_hash, faculty, photo_url, role, bio)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             RETURNING id'
        );
        $stmt->execute([$name, $email, $passwordHash, $faculty, '', $role, $bio]);
        $row = $stmt->fetch();
        return (int) $row['id'];
    }

    public function update(int $id, array $fields): bool
    {
        if (empty($fields)) return false;

        $allowed = ['name', 'faculty', 'bio', 'photo_url'];
        $sets    = [];
        $values  = [];

        foreach ($allowed as $col) {
            if (array_key_exists($col, $fields)) {
                $sets[]   = "$col = ?";
                $values[] = $fields[$col];
            }
        }

        if (empty($sets)) return false;

        $values[] = $id;
        $sql  = 'UPDATE "User" SET ' . implode(', ', $sets) . ' WHERE id = ?';
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($values);
    }

    public function getAllTutors(string $keyword = '', string $faculty = ''): array
    {
        $sql = '
            SELECT
                u.id,
                u.name,
                u.faculty,
                u.bio,
                u.photo_url,
                s.id   AS skill_id,
                s.name AS skill,
                us.hourly_rate AS price,
                us.hourly_rate AS rate_per_hour,
                us.level,
                COALESCE(
                    (SELECT AVG(r.rating)
                       FROM "Review" r
                       JOIN "Booking" b ON b.id = r.booking_id
                      WHERE b.tutor_id = u.id),
                    4.5
                ) AS rating
            FROM "User" u
            JOIN "UserSkill" us ON us.user_id = u.id
            JOIN "Skill" s      ON s.id       = us.skill_id
            WHERE u.role = ?
        ';

        $params = ['tutor'];

        if ($keyword) {
            $sql     .= ' AND (u.name ILIKE ? OR s.name ILIKE ? OR u.bio ILIKE ? OR u.faculty ILIKE ?)';
            $like     = '%' . $keyword . '%';
            $params   = array_merge($params, [$like, $like, $like, $like]);
        }

        if ($faculty) {
            $sql    .= ' AND u.faculty = ?';
            $params[] = $faculty;
        }

        $sql .= ' ORDER BY u.name, s.name';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getConversations(int $userId): array
    {
        $sql = '
            SELECT DISTINCT
                CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END AS other_id,
                u.name AS other_name,
                u.role AS other_role,
                (SELECT body FROM "Message"
                  WHERE (sender_id = ? AND receiver_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)
                     OR (sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END AND receiver_id = ?)
                  ORDER BY sent_at DESC LIMIT 1) AS last_message,
                (SELECT sent_at FROM "Message"
                  WHERE (sender_id = ? AND receiver_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)
                     OR (sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END AND receiver_id = ?)
                  ORDER BY sent_at DESC LIMIT 1) AS last_at
            FROM "Message" m
            JOIN "User" u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
            WHERE m.sender_id = ? OR m.receiver_id = ?
        ';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$userId, $userId, $userId, $userId, $userId, $userId, $userId, $userId, $userId, $userId, $userId, $userId]);
        return $stmt->fetchAll();
    }

    public function getMessages(int $meId, int $otherId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT m.*, u.name AS sender_name, u.role AS sender_role
               FROM "Message" m
               JOIN "User" u ON u.id = m.sender_id
              WHERE (m.sender_id = ? AND m.receiver_id = ?)
                 OR (m.sender_id = ? AND m.receiver_id = ?)
              ORDER BY m.sent_at ASC'
        );
        $stmt->execute([$meId, $otherId, $otherId, $meId]);
        return $stmt->fetchAll();
    }

    public function sendMessage(int $senderId, int $receiverId, string $body): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO "Message" (sender_id, receiver_id, body, sent_at) VALUES (?, ?, ?, NOW()) RETURNING id'
        );
        $stmt->execute([$senderId, $receiverId, $body]);
        $row = $stmt->fetch();
        return (int) $row['id'];
    }
}
