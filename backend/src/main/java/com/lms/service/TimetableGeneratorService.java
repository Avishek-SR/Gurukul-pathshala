package com.lms.service;

import com.lms.model.Course;
import com.lms.model.Timetable;
import com.lms.repository.CourseRepository;
import com.lms.repository.TimetableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TimetableGeneratorService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TimetableRepository timetableRepository;

    private static final List<Timetable.DayOfWeek> DAYS = Arrays.asList(
            Timetable.DayOfWeek.SUNDAY,
            Timetable.DayOfWeek.MONDAY,
            Timetable.DayOfWeek.TUESDAY,
            Timetable.DayOfWeek.WEDNESDAY,
            Timetable.DayOfWeek.THURSDAY,
            Timetable.DayOfWeek.FRIDAY);

    // 6 Slots: 9:00, 10:00, 11:00, 12:00, 13:00, 14:00 (End 15:00)
    private static final List<LocalTime> START_TIMES = Arrays.asList(
            LocalTime.of(9, 0),
            LocalTime.of(10, 0),
            LocalTime.of(11, 0),
            LocalTime.of(12, 0),
            LocalTime.of(13, 0),
            LocalTime.of(14, 0));

    @Transactional
    public void generateTimetable(String program, String section, String shift, List<String> constraints) {
        // 1. Fetch all active courses for this class
        List<Course> courses = courseRepository.findByProgram(program);

        // Filter by section (allow courses with null section (common) or matching
        // specific section)
        if (section != null && !section.isEmpty()) {
            courses = courses.stream()
                    .filter(c -> c.isActive())
                    .filter(c -> c.getSection() == null || c.getSection().isEmpty()
                            || c.getSection().equalsIgnoreCase(section))
                    .collect(Collectors.toList());
        } else {
            courses = courses.stream()
                    .filter(c -> c.isActive())
                    .collect(Collectors.toList());
        }

        if (courses.isEmpty()) {
            throw new IllegalArgumentException(
                    "No courses found for " + program + " " + (section.isEmpty() ? "All Sections" : section));
        }

        // 2. Clear existing
        timetableRepository.deleteByProgramAndSection(program, section);

        // 3. Round-Robin Scheduling
        Random rand = new Random();
        boolean checkFaculty = constraints != null && constraints.contains("checkFacultyAvailability");
        boolean shuffleSubjects = constraints != null && constraints.contains("shuffleSubjects");

        for (Timetable.DayOfWeek day : DAYS) {
            // Shuffle courses at the start of the day to ensure variety across the week
            if (shuffleSubjects) {
                Collections.shuffle(courses, rand);
            }

            int courseIndex = 0;

            for (LocalTime startTime : START_TIMES) {
                LocalTime endTime = startTime.plusHours(1);
                boolean slotFilled = false;

                // Try to find a suitable course starting from current index
                for (int i = 0; i < courses.size(); i++) {
                    int tryIndex = (courseIndex + i) % courses.size();
                    Course course = courses.get(tryIndex);

                    // Constraint 1: Faculty Availability
                    if (checkFaculty && course.getFaculty() != null) {
                        boolean facultyBusy = timetableRepository.existsByFacultyOverlap(
                                course.getFaculty().getId(), day, startTime, endTime);
                        if (facultyBusy) {
                            continue; // Try next course
                        }
                    }

                    // Assign
                    Timetable entry = new Timetable();
                    entry.setCourse(course);
                    entry.setDayOfWeek(day);
                    entry.setStartTime(startTime);
                    entry.setEndTime(endTime);
                    entry.setShift(shift);

                    // Generate a unique room name to avoid constraint violations
                    // Constraint: (day, start_time, room) must be unique
                    // Using "Program - Section" or just "Program" ensures uniqueness across
                    // different classes
                    String roomName = program;
                    if (section != null && !section.isEmpty()) {
                        roomName += " - " + section;
                    }
                    entry.setRoomNumber(roomName);

                    timetableRepository.save(entry);

                    // Successful assignment
                    // Advance the global courseIndex so the next slot starts with the *next* course
                    // in the list
                    // (tryIndex + 1) effectively moves us forward.
                    // We actually want to move the base pointer to (tryIndex + 1) % size
                    courseIndex = (tryIndex + 1) % courses.size();

                    slotFilled = true;
                    break; // Break inner loop (course finding), move to next time slot
                }

                // If slotFilled is false, it means we couldn't find ANY course for this slot
                // (all faculties busy?)
                // We just leave it empty.
            }
        }
    }
}
