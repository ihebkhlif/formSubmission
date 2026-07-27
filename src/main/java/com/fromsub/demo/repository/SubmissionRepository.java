package com.fromsub.demo.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.fromsub.demo.model.Submission;

public interface SubmissionRepository extends MongoRepository<Submission, String> {

}
