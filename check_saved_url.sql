SELECT 
    u.email,
    uf.final_url,
    uf.updated_at
FROM users u
LEFT JOIN user_filters uf ON u.id = uf.user_id
WHERE u.email LIKE '%@%'
ORDER BY uf.updated_at DESC
LIMIT 5;
