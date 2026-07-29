package com.fromsub.demo.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.fromsub.demo.model.Employee;

public interface EmployeeRepository extends MongoRepository<Employee, String> {
    Optional<Employee> findByNameIgnoreCase(String name);
}
