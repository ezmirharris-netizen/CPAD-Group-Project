<?php

namespace App\Models;

use PDO;

class SkillModels
{
    public function __construct(private PDO $pdo) {}

    public function findAll(): array
    {
        return $this->pdo->query('SELECT * FROM `skills` ORDER BY category, name')->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM `skills` WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function findByCategory(string $category): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM `skills` WHERE category = ? ORDER BY name');
        $stmt->execute([$category]);
        return $stmt->fetchAll();
    }

    public function getUserSkills(int $userId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT s.*, us.hourly_rate, us.level
               FROM `skills` s
               JOIN `user_skills` us ON us.skill_id = s.id
              WHERE us.user_id = ?
              ORDER BY s.name'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function addUserSkill(int $userId, int $skillId, float $hourlyRate, string $level): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO `user_skills` (user_id, skill_id, hourly_rate, level) VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE hourly_rate = VALUES(hourly_rate), level = VALUES(level)'
        );
        $stmt->execute([$userId, $skillId, $hourlyRate, $level]);

        $id = $this->pdo->lastInsertId();
        if ((int) $id === 0) {
            // Row already existed (UPDATE branch) — look up its id
            $lookup = $this->pdo->prepare('SELECT id FROM `user_skills` WHERE user_id = ? AND skill_id = ? LIMIT 1');
            $lookup->execute([$userId, $skillId]);
            $row = $lookup->fetch();
            return (int) ($row['id'] ?? 0);
        }
        return (int) $id;
    }

    public function removeUserSkill(int $userId, int $skillId): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM `user_skills` WHERE user_id = ? AND skill_id = ?');
        return $stmt->execute([$userId, $skillId]);
    }
}
