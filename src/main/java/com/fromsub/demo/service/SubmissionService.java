package com.fromsub.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fromsub.demo.model.LeaveStatus;
import com.fromsub.demo.model.Submission;
import com.fromsub.demo.repository.SubmissionRepository;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    public Submission saveSubmission(Submission submission) {
        if (submission.getEndDate().isBefore(submission.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date.");
        }
        submission.setStatus(LeaveStatus.PENDING);
        submission.setSubmittedAt(java.time.LocalDateTime.now());
        return submissionRepository.save(submission);
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
            return submissionRepository.save(existingSubmission);
        }
        return null;
    }
}
