package com.fromsub.demo.service;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fromsub.demo.model.Employee;
import com.fromsub.demo.model.LeaveStatus;
import com.fromsub.demo.model.Submission;
import com.fromsub.demo.repository.SubmissionRepository;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private EmployeeService employeeService;

    public Submission saveSubmission(Submission submission) {
        if (submission.getEndDate().isBefore(submission.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date.");
        }

        long requestedDays = ChronoUnit.DAYS.between(submission.getStartDate(), submission.getEndDate()) + 1;

        List<Submission> existingSubmissions = submissionRepository.findAll();

        // 1. Check for overlapping leave requests for the same employee
        for (Submission existing : existingSubmissions) {
            if (existing.getEmployeeName() != null &&
                existing.getEmployeeName().equalsIgnoreCase(submission.getEmployeeName()) &&
                existing.getStatus() != LeaveStatus.Rejected) {

                if (existing.getStartDate() != null && existing.getEndDate() != null) {
                    boolean overlaps = !submission.getStartDate().isAfter(existing.getEndDate()) &&
                                       !submission.getEndDate().isBefore(existing.getStartDate());
                    if (overlaps) {
                        throw new IllegalArgumentException(
                            "Overlapping leave request! Employee " + submission.getEmployeeName() +
                            " already has an active leave request from " + existing.getStartDate() +
                            " to " + existing.getEndDate() + "."
                        );
                    }
                }
            }
        }

        // 2. Check annual leave credit limit
        Optional<Employee> empOpt = employeeService.getEmployeeByName(submission.getEmployeeName());
        if (empOpt.isPresent()) {
            Employee employee = empOpt.get();
            int currentUsed = employeeService.calculateUsedCredit(employee.getName(), existingSubmissions);
            int remaining = employee.getAnnualCredit() - currentUsed;

            if (requestedDays > remaining) {
                throw new IllegalArgumentException(
                    "Leave request limit exceeded! Requested " + requestedDays + 
                    " day(s), but employee " + employee.getName() + " has only " + 
                    Math.max(0, remaining) + " day(s) remaining out of " + 
                    employee.getAnnualCredit() + " annual credit days."
                );
            }
        }

        submission.setStatus(LeaveStatus.Waiting_For_Approval);
        submission.setSubmittedAt(java.time.LocalDateTime.now());
        Submission saved = submissionRepository.save(submission);
        // Persist updated credits to MongoDB
        employeeService.syncCreditsForEmployee(submission.getEmployeeName());
        return saved;
    }

    public List<Submission> getAllSubmissions() {
        return submissionRepository.findAll();
    }

    public Submission getSubmissionById(String id) {
        return submissionRepository.findById(id).orElse(null);
    }

    public void deleteSubmission(String id) {
        submissionRepository.deleteById(id);
    }

    public Submission updateSubmission(String id, Submission updatedSubmission) {
        Submission existingSubmission = submissionRepository.findById(id).orElse(null);
        if (existingSubmission != null) {
            existingSubmission.setEmployeeName(updatedSubmission.getEmployeeName());
            existingSubmission.setStartDate(updatedSubmission.getStartDate());
            existingSubmission.setEndDate(updatedSubmission.getEndDate());
            existingSubmission.setLeaveType(updatedSubmission.getLeaveType());
            existingSubmission.setReason(updatedSubmission.getReason());
            existingSubmission.setStatus(updatedSubmission.getStatus());
            existingSubmission.setSubmittedAt(updatedSubmission.getSubmittedAt());
            Submission result = submissionRepository.save(existingSubmission);
            // Persist updated credits to MongoDB after status changes
            employeeService.syncCreditsForEmployee(existingSubmission.getEmployeeName());
            return result;
        }
        return null;
    }
}
