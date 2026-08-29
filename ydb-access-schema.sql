-- OGE Navigator / Firebase pilot
-- YDB table for access rights only.
-- Catalog/media stay in the existing Yandex content layer.

CREATE TABLE IF NOT EXISTS `oge_access` (
    principal_key Utf8 NOT NULL,
    firebase_uid Utf8,
    access_level Utf8,
    status Utf8,
    role Utf8,
    valid_until Timestamp,
    display_name Utf8,
    source Utf8,
    note Utf8,
    created_at Timestamp,
    updated_at Timestamp,
    PRIMARY KEY (principal_key)
);
