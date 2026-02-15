package com.lms.service.impl;

import com.lms.dto.TimetableDTO;
import com.lms.exception.ResourceNotFoundException;
import com.lms.model.Course;
import com.lms.model.Timetable;
import com.lms.repository.CourseRepository;
import com.lms.repository.TimetableRepository;
import com.lms.service.TimetableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TimetableServiceImpl implements TimetableService {

    @Autowired
    private TimetableRepository timetableRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Override
    @Transactional
    public TimetableDTO createTimetableEntry(TimetableDTO dto) {
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + dto.getCourseId()));

        Timetable.DayOfWeek day = Timetable.DayOfWeek.valueOf(dto.getDayOfWeek().toUpperCase());
        LocalTime start = dto.getStartTime();
        LocalTime end = dto.getEndTime();

        System.out.println("DEBUG: Creating Timetable. Course=" + course.getName() + ", Program=" + course.getProgram()
                + ", Section=" + course.getSection() + ", Shift=" + dto.getShift());
        System.out.println("DEBUG: Time=" + day + " " + start + "-" + end);

        // Check for overlaps
        // 1. Class overlap (same class, same time, SAME SHIFT)
        boolean classOverlap = timetableRepository.existsByClassOverlap(course.getProgram(), course.getSection(),
                dto.getShift(), day, start, end);
        if (classOverlap) {
            System.out.println("DEBUG: Class Overlap Detected!");
            throw new IllegalArgumentException(
                    "Schedule overlap detected for this class in " + dto.getShift() + " shift.");
        }

        // 2. Faculty overlap (same faculty, same time - even if different course/class)
        if (course.getFaculty() != null) {
            boolean facultyOverlap = timetableRepository.existsByFacultyOverlap(course.getFaculty().getId(), day, start,
                    end);
            if (facultyOverlap) {
                System.out.println("DEBUG: Faculty Overlap Detected! FacultyID=" + course.getFaculty().getId());
                throw new IllegalArgumentException("Schedule overlap detected for the faculty member.");
            }
        }

        // 3. Room overlap (same room, same time)
        if (dto.getRoomNumber() != null && !dto.getRoomNumber().isEmpty()) {
            boolean roomOverlap = timetableRepository.existsByRoomOverlap(dto.getRoomNumber(), day, start, end);
            if (roomOverlap) {
                System.out.println("DEBUG: Room Overlap Detected! Room=" + dto.getRoomNumber());
                throw new IllegalArgumentException("Room " + dto.getRoomNumber() + " is already booked for this time.");
            }
        }

        Timetable timetable = new Timetable();
        timetable.setCourse(course);
        timetable.setDayOfWeek(day);
        timetable.setStartTime(start);
        timetable.setEndTime(end);
        timetable.setEndTime(end);
        timetable.setRoomNumber(dto.getRoomNumber());
        timetable.setShift(dto.getShift());

        Timetable saved = timetableRepository.save(timetable);
        System.out.println("DEBUG: Timetable Saved ID=" + saved.getId());
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteTimetableEntry(Long id) {
        if (!timetableRepository.existsById(id)) {
            throw new ResourceNotFoundException("Timetable entry not found with id: " + id);
        }
        timetableRepository.deleteById(id);
    }

    @Override
    public List<TimetableDTO> getTimetableByProgramAndSection(String program, String section, String shift) {
        System.out
                .println("DEBUG: Fetching Timetable for Program=" + program + ", Section=" + section + ", Shift="
                        + shift);
        List<Timetable> timetables;
        if (shift != null && !shift.isEmpty() && !shift.equals("All")) {
            timetables = timetableRepository.findByProgramAndSectionAndShift(program, section, shift);
        } else {
            timetables = timetableRepository.findByProgramAndSection(program, section);
        }
        System.out.println("DEBUG: Found " + timetables.size() + " entries.");
        return timetables.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<TimetableDTO> getTimetableForFaculty(Long facultyId) {
        List<Timetable> timetables = timetableRepository.findByFacultyId(facultyId);
        return timetables.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Autowired
    private com.lms.service.TimetableGeneratorService timetableGeneratorService;

    @Override
    @Transactional
    public void deleteAllTimetables(String program, String section) {
        timetableRepository.deleteByProgramAndSection(program, section);
    }

    @Override
    @Transactional
    public void generateTimetable(String program, String section, String shift, List<String> constraints) {
        timetableGeneratorService.generateTimetable(program, section, shift, constraints);
    }

    private TimetableDTO convertToDTO(Timetable entity) {
        TimetableDTO dto = new TimetableDTO();
        dto.setId(entity.getId());
        dto.setCourseId(entity.getCourse().getId());
        dto.setCourseName(entity.getCourse().getName());
        dto.setCourseCode(entity.getCourse().getCode());
        dto.setProgram(entity.getCourse().getProgram());
        dto.setSection(entity.getCourse().getSection());
        if (entity.getCourse().getFaculty() != null) {
            dto.setFacultyName(entity.getCourse().getFaculty().getName());
        }
        dto.setDayOfWeek(entity.getDayOfWeek().toString());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setRoomNumber(entity.getRoomNumber());
        dto.setShift(entity.getShift());
        return dto;
    }
}
