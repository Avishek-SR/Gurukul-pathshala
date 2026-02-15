package com.lms.service;

import com.lms.dto.ActivityTopicDTO;
import com.lms.dto.ClassroomActivityDTO;
import com.lms.model.ActivityTopic;
import com.lms.model.ClassroomActivity;
import com.lms.model.Course;
import com.lms.model.User;

import com.lms.repository.ActivityTopicRepository;
import com.lms.repository.ClassroomActivityRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassroomActivityService {

        private final ClassroomActivityRepository activityRepository;
        private final ActivityTopicRepository topicRepository;
        private final CourseRepository courseRepository;
        private final UserRepository userRepository;

        // --- ACTIVITY (Parent) METHODS ---

        @Transactional(readOnly = true)
        public List<ClassroomActivityDTO> getActivitiesByCourse(Long courseId) {
                List<ClassroomActivity> activities = activityRepository
                                .findByCourseIdOrderByCreatedAtDesc(courseId);
                return activities.stream().map(this::mapActivityToDTO).collect(Collectors.toList());
        }

        @Transactional
        public ClassroomActivityDTO createActivity(Long courseId, Long facultyId, String title, String description) {
                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new RuntimeException("Course not found"));

                User faculty = userRepository.findById(facultyId)
                                .orElseThrow(() -> new RuntimeException("Faculty not found"));

                ClassroomActivity activity = ClassroomActivity.builder()
                                .title(title)
                                .description(description)

                                .course(course)
                                .createdBy(faculty)
                                .build();

                ClassroomActivity savedActivity = activityRepository.save(activity);
                return mapActivityToDTO(savedActivity);
        }

        @Transactional
        public void deleteActivity(Long activityId) {
                activityRepository.deleteById(activityId);
        }

        // --- TOPIC (Child) METHODS ---

        @Transactional(readOnly = true)
        public List<ActivityTopicDTO> getTopicsByActivity(Long activityId) {
                List<ActivityTopic> topics = topicRepository.findByActivityIdOrderByCreatedAtDesc(activityId);
                return topics.stream().map(this::mapTopicToDTO).collect(Collectors.toList());
        }

        @Transactional
        public ActivityTopicDTO createTopic(Long activityId, String title, String description,
                        String studyMaterialUrl) {
                ClassroomActivity activity = activityRepository.findById(activityId)
                                .orElseThrow(() -> new RuntimeException("Activity not found"));

                ActivityTopic topic = ActivityTopic.builder()
                                .title(title)
                                .description(description)
                                .studyMaterialUrl(studyMaterialUrl)
                                .activity(activity)
                                .build();

                return mapTopicToDTO(topicRepository.save(topic));
        }

        @Transactional
        public ActivityTopicDTO updateTopic(Long topicId, String title, String description, String studyMaterialUrl) {
                ActivityTopic topic = topicRepository.findById(topicId)
                                .orElseThrow(() -> new RuntimeException("Topic not found"));

                if (title != null)
                        topic.setTitle(title);
                if (description != null)
                        topic.setDescription(description);
                if (studyMaterialUrl != null)
                        topic.setStudyMaterialUrl(studyMaterialUrl);

                return mapTopicToDTO(topicRepository.save(topic));
        }

        @Transactional
        public ActivityTopicDTO assignTopic(Long topicId, Long studentId) {
                ActivityTopic topic = topicRepository.findById(topicId)
                                .orElseThrow(() -> new RuntimeException("Topic not found"));

                if (topic.getAssignedStudent() != null) {
                        throw new RuntimeException("This topic is already taken by another student.");
                }

                // Check if student already has a topic for this parent activity
                boolean alreadyHasTopic = topicRepository.findByActivityIdAndAssignedStudentId(
                                topic.getActivity().getId(), studentId).isPresent();

                if (alreadyHasTopic) {
                        throw new RuntimeException(
                                        "You have already selected a topic for this activity. You cannot change it.");
                }

                User student = userRepository.findById(studentId)
                                .orElseThrow(() -> new RuntimeException("Student not found"));

                topic.setAssignedStudent(student);
                return mapTopicToDTO(topicRepository.save(topic));
        }

        @Transactional
        public ActivityTopicDTO unassignTopic(Long topicId) {
                ActivityTopic topic = topicRepository.findById(topicId)
                                .orElseThrow(() -> new RuntimeException("Topic not found"));

                topic.setAssignedStudent(null);
                return mapTopicToDTO(topicRepository.save(topic));
        }

        @Transactional
        public void deleteTopic(Long topicId) {
                topicRepository.deleteById(topicId);
        }

        @Transactional
        public ActivityTopicDTO submitTopicWork(Long topicId, String fileUrl) {
                ActivityTopic topic = topicRepository.findById(topicId)
                                .orElseThrow(() -> new RuntimeException("Topic not found"));

                topic.setSubmissionUrl(fileUrl);
                topic.setSubmissionStatus(com.lms.model.enums.SubmissionStatus.SUBMITTED);
                topic.setSubmissionDate(java.time.LocalDateTime.now());

                return mapTopicToDTO(topicRepository.save(topic));
        }

        @Transactional
        public ActivityTopicDTO verifyTopicWork(Long topicId, com.lms.model.enums.SubmissionStatus status,
                        Integer grade, String feedback) {
                ActivityTopic topic = topicRepository.findById(topicId)
                                .orElseThrow(() -> new RuntimeException("Topic not found"));

                topic.setSubmissionStatus(status);
                if (grade != null)
                        topic.setGrade(grade);
                if (feedback != null)
                        topic.setFeedback(feedback);

                return mapTopicToDTO(topicRepository.save(topic));
        }

        // --- MAPPERS ---

        private ClassroomActivityDTO mapActivityToDTO(ClassroomActivity activity) {
                return ClassroomActivityDTO.builder()
                                .id(activity.getId())
                                .title(activity.getTitle())
                                .description(activity.getDescription())

                                .courseId(activity.getCourse().getId())
                                .courseName(activity.getCourse().getName() != null ? activity.getCourse().getName()
                                                : activity.getCourse().getTitle())
                                .courseCode(activity.getCourse().getCode())
                                .createdById(activity.getCreatedBy().getId())
                                .createdByName(activity.getCreatedBy().getName())
                                // Topics can be fetched separately or lazily if needed
                                .createdAt(activity.getCreatedAt())
                                .build();
        }

        private ActivityTopicDTO mapTopicToDTO(ActivityTopic topic) {
                return ActivityTopicDTO.builder()
                                .id(topic.getId())
                                .title(topic.getTitle())
                                .description(topic.getDescription())
                                .activityId(topic.getActivity().getId())
                                .activityTitle(topic.getActivity().getTitle())
                                .assignedStudentId(
                                                topic.getAssignedStudent() != null ? topic.getAssignedStudent().getId()
                                                                : null)
                                .assignedStudentName(topic.getAssignedStudent() != null
                                                ? topic.getAssignedStudent().getName()
                                                : null)
                                .assignedStudentUserId(topic.getAssignedStudent() != null
                                                ? topic.getAssignedStudent().getUserId()
                                                : null)
                                .createdAt(topic.getCreatedAt())

                                .submissionUrl(topic.getSubmissionUrl())
                                .studyMaterialUrl(topic.getStudyMaterialUrl())
                                .submissionStatus(topic.getSubmissionStatus())
                                .submissionDate(topic.getSubmissionDate())
                                .grade(topic.getGrade())
                                .feedback(topic.getFeedback())
                                .build();
        }
}
