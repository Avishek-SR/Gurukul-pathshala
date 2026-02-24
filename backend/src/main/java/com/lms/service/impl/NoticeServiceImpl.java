package com.lms.service.impl;

import com.lms.model.Notice;
import com.lms.repository.NoticeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.LocalDate;

@Service
public class NoticeServiceImpl {

    @Autowired
    private NoticeRepository noticeRepository;

    public List<Notice> getActiveNotices() {
        return noticeRepository.findByIsActiveTrueOrderByPriorityDescPublishDateDesc();
    }

    public List<Notice> getAllNotices() {
        return noticeRepository.findAll();
    }

    public Notice saveNotice(Notice notice) {
        if (notice.getPublishDate() == null) {
            notice.setPublishDate(LocalDate.now());
        }
        return noticeRepository.save(notice);
    }

    public void deleteNotice(Long id) {
        noticeRepository.deleteById(id);
    }

    public Notice getNoticeById(Long id) {
        return noticeRepository.findById(id).orElse(null);
    }
}
