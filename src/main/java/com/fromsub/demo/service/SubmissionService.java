package com.fromsub.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fromsub.demo.model.Submission;
import com.fromsub.demo.repository.SubmissionRepository;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;
    
    public Submission saveSubmission(Submission submission) {
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
            existingSubmission.setFirstName(updatedSubmission.getFirstName());
            existingSubmission.setLastName(updatedSubmission.getLastName());
            existingSubmission.setEmail(updatedSubmission.getEmail());
            return submissionRepository.save(existingSubmission);
        }
        return null;
    }
    public Submission getSubmissionByEmail(String email) {
        return submissionRepository.findByEmail(email);
    }
}
