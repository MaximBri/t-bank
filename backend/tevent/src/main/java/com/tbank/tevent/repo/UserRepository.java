package com.tbank.tevent.repo;

import com.tbank.tevent.repo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByLogin(String login);
    Optional<User> findById(UUID id);
    List<User> findAllByIdIn(Collection<UUID> ids);
}
