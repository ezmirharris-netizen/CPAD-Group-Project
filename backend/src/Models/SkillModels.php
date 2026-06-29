<?php

namespace App\Models;

use PDO;

class SkillModels
{
    public function __construct(private PDO $pdo) {}

    public function findAll(): array
    {
        return $this->pdo->query('SELECT * FROM Skill ORDER BY category, name')->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM Skill WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function findByCategory(string $category): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM Skill WHERE category = ? ORDER BY name');
        $stmt->execute([$category]);
        return $stmt->fetchAll();
    }

    public function getUserSkills(int $userId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT s.*, us.hourly_rate, us.level
               FROM Skill s
               JOIN UserSkill us ON us.skill_id = s.id
              WHERE us.user_id = ?
              ORDER BY s.name'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function addUserSkill(int $userId, int $skillId, float $hourlyRate, string $level): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO UserSkill (user_id, skill_id, hourly_rate, level) VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE hourly_rate = VALUES(hourly_rate), level = VALUES(level)'
        );
        $stmt->execute([$userId, $skillId, $hourlyRate, $level]);
        return (int) $this->pdo->lastInsertId();
    }

    public function removeUserSkill(int $userId, int $skillId): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM UserSkill WHERE user_id = ? AND skill_id = ?');
        return $stmt->execute([$userId, $skillId]);
    }
}
