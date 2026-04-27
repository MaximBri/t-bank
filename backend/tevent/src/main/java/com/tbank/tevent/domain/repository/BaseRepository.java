package com.tbank.tevent.domain.repository;

import java.util.List;
import java.util.Optional;

/**
 * Базовый интерфейс репозитория для CRUD операций
 * 
 * @param <T> тип сущности
 * @param <ID> тип идентификатора
 */
public interface BaseRepository<T, ID> {
    
    /**
     * Сохранение сущности
     * 
     * @param entity сущность для сохранения
     * @return сохраненная сущность
     */
    T save(T entity);
    
    /**
     * Сохранение нескольких сущностей
     * 
     * @param entities список сущностей
     * @return список сохраненных сущностей
     */
    List<T> saveAll(Iterable<T> entities);
    
    /**
     * Поиск сущности по ID
     * 
     * @param id идентификатор сущности
     * @return сущность, если найдена
     */
    Optional<T> findById(ID id);
    
    /**
     * Проверка существования сущности по ID
     * 
     * @param id идентификатор сущности
     * @return true если сущность существует
     */
    boolean existsById(ID id);
    
    /**
     * Получение всех сущностей
     * 
     * @return список всех сущностей
     */
    List<T> findAll();
    
    /**
     * Получение всех сущностей по списку ID
     * 
     * @param ids список идентификаторов
     * @return список сущностей
     */
    List<T> findAllById(Iterable<ID> ids);
    
    /**
     * Получение количества сущностей
     * 
     * @return количество сущностей
     */
    long count();
    
    /**
     * Удаление сущности по ID
     * 
     * @param id идентификатор сущности
     */
    void deleteById(ID id);
    
    /**
     * Удаление сущности
     * 
     * @param entity сущность для удаления
     */
    void delete(T entity);
    
    /**
     * Удаление нескольких сущностей
     * 
     * @param entities список сущностей
     */
    void deleteAll(Iterable<? extends T> entities);
    
    /**
     * Удаление всех сущностей
     */
    void deleteAll();
}