<?php
/**
 * Migration: create notifications table
 * Run once via: GET /api/index.php?route=runMigrations
 * Or it auto-runs on first NotificationController call.
 */

function ensureNotificationsTable(PDO $conn): void
{
    $conn->exec("
        CREATE TABLE IF NOT EXISTS notifications (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            title           TEXT    NOT NULL,
            description     TEXT    NOT NULL,
            type            TEXT    NOT NULL DEFAULT 'system',
            priority        TEXT    NOT NULL DEFAULT 'medium',
            target_audience TEXT    NOT NULL DEFAULT 'all',
            is_unread       INTEGER NOT NULL DEFAULT 1,
            is_new          INTEGER NOT NULL DEFAULT 1,
            created_by      TEXT    NOT NULL DEFAULT 'system',
            created_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
            updated_at      TEXT
        )
    ");

    // Index for fast unread queries
    $conn->exec("
        CREATE INDEX IF NOT EXISTS idx_notifications_unread
        ON notifications (is_unread, created_at DESC)
    ");

    // Index for audience filtering
    $conn->exec("
        CREATE INDEX IF NOT EXISTS idx_notifications_audience
        ON notifications (target_audience, created_at DESC)
    ");
}
