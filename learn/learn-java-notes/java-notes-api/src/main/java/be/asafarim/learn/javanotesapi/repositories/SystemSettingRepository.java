package be.asafarim.learn.javanotesapi.repositories;

import be.asafarim.learn.javanotesapi.entities.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, UUID> {

    Optional<SystemSetting> findByKey(String key);

    boolean existsByKey(String key);

    List<SystemSetting> findByCategory(String category);

    List<SystemSetting> findAllByOrderByCategoryAscKeyAsc();

    default String getSettingValue(String key, String defaultValue) {
        return findByKey(key)
                .map(SystemSetting::getValue)
                .orElse(defaultValue);
    }

    default boolean getBooleanSetting(String key, boolean defaultValue) {
        return findByKey(key)
                .map(s -> "true".equalsIgnoreCase(s.getValue()))
                .orElse(defaultValue);
    }

    default int getIntSetting(String key, int defaultValue) {
        return findByKey(key)
                .map(s -> {
                    try {
                        return Integer.parseInt(s.getValue());
                    } catch (NumberFormatException e) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }
}
