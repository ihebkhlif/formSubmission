package com.fromsub.demo.service;

import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fromsub.demo.model.Employee;
import com.fromsub.demo.model.LeaveStatus;
import com.fromsub.demo.model.Submission;
import com.fromsub.demo.model.WorkTeam;
import com.fromsub.demo.repository.EmployeeRepository;
import com.fromsub.demo.repository.SubmissionRepository;

import jakarta.annotation.PostConstruct;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @PostConstruct
    public void initDefaultEmployees() {
        if (employeeRepository.count() == 0) {
            List<Employee> defaultEmployees = Arrays.asList(
                    new Employee("Sarah Jenkins", WorkTeam.DEV, 25),
                    new Employee("Alex Rivera", WorkTeam.DEVOPS, 25),
                    new Employee("Michael Chen", WorkTeam.TESTING, 25),
                    new Employee("Emma Watson", WorkTeam.MARKETING, 25));
            employeeRepository.saveAll(defaultEmployees);
        }
    }

    /**
     * Returns all employees with their stored credit values.
     * Credits are kept in sync by syncCreditsForEmployee() which runs
     * on every submission create/update, so no recalculation needed here.
     */
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Optional<Employee> getEmployeeById(String id) {
        return employeeRepository.findById(id);
    }

    public Optional<Employee> getEmployeeByName(String name) {
        return employeeRepository.findByNameIgnoreCase(name);
    }

    public Employee saveEmployee(Employee employee) {
        // Compute credits based on existing submissions for this employee
        List<Submission> allSubmissions = submissionRepository.findAll();
        int used = calculateUsedCredit(employee.getName(), allSubmissions);
        employee.setUsedCredit(used);
        employee.setRemainingCredit(Math.max(0, employee.getAnnualCredit() - used));
        return employeeRepository.save(employee);
    }

    public void deleteEmployee(String id) {
        employeeRepository.deleteById(id);
    }

    /**
     * Call this after any submission is created/updated/deleted to keep
     * the employee's usedCredit and remainingCredit in sync in MongoDB.
     */
    public void syncCreditsForEmployee(String employeeName) {
        employeeRepository.findByNameIgnoreCase(employeeName).ifPresent(emp -> {
            List<Submission> allSubmissions = submissionRepository.findAll();
            int used = calculateUsedCredit(emp.getName(), allSubmissions);
            emp.setUsedCredit(used);
            emp.setRemainingCredit(Math.max(0, emp.getAnnualCredit() - used));
            employeeRepository.save(emp);
        });
    }

    /**
     * Recalculate and persist credits for ALL employees.
     * Use this as a one-time sync or admin action, not on every GET.
     */
    public void syncAllEmployeeCredits() {
        List<Employee> employees = employeeRepository.findAll();
        List<Submission> allSubmissions = submissionRepository.findAll();

        for (Employee emp : employees) {
            int used = calculateUsedCredit(emp.getName(), allSubmissions);
            emp.setUsedCredit(used);
            emp.setRemainingCredit(Math.max(0, emp.getAnnualCredit() - used));
        }

        employeeRepository.saveAll(employees);
    }

    public int calculateUsedCredit(String employeeName, List<Submission> submissions) {
        int totalDays = 0;
        for (Submission sub : submissions) {
            if (sub.getEmployeeName() != null &&
                    sub.getEmployeeName().equalsIgnoreCase(employeeName) &&
                    sub.getStatus() != LeaveStatus.Rejected) {

                if (sub.getStartDate() != null && sub.getEndDate() != null) {
                    long days = ChronoUnit.DAYS.between(sub.getStartDate(), sub.getEndDate()) + 1;
                    if (days > 0) {
                        totalDays += (int) days;
                    }
                }
            }
        }
        return totalDays;
    }
}
