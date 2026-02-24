package com.lms.service.impl;

import com.lms.model.SystemSetting;
import com.lms.repository.SystemSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SystemSettingServiceImpl {

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    public Map<String, String> getAllPublicSettings() {
        List<SystemSetting> settings = systemSettingRepository.findAll();
        Map<String, String> settingsMap = new HashMap<>();
        for (SystemSetting setting : settings) {
            settingsMap.put(setting.getSettingKey(), setting.getSettingValue());
        }
        return settingsMap;
    }

    public SystemSetting updateSetting(String key, String value, String description, String group) {
        Optional<SystemSetting> existing = systemSettingRepository.findBySettingKey(key);
        SystemSetting setting;
        if (existing.isPresent()) {
            setting = existing.get();
            setting.setSettingValue(value);
            if (description != null)
                setting.setDescription(description);
            if (group != null)
                setting.setGroupName(group);
        } else {
            setting = new SystemSetting();
            setting.setSettingKey(key);
            setting.setSettingValue(value);
            setting.setDescription(description);
            setting.setGroupName(group);
        }
        return systemSettingRepository.save(setting);
    }

    public List<SystemSetting> getAllSettingsForAdmin() {
        return systemSettingRepository.findAll();
    }

    public void deleteSetting(String key) {
        Optional<SystemSetting> existing = systemSettingRepository.findBySettingKey(key);
        existing.ifPresent(systemSettingRepository::delete);
    }
}
