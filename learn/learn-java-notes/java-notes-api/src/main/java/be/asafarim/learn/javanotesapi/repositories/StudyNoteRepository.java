package be.asafarim.learn.javanotesapi.repositories;

import be.asafarim.learn.javanotesapi.entities.StudyNote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudyNoteRepository extends JpaRepository<StudyNote, Long> {
}
