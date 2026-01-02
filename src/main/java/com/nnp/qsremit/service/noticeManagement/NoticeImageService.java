/**
 * 개발자 : 채호정
 * 개발일 : 2025년 04월 08일
 * 개발목적 :인증된 사용자 정보를 기반으로 이슈 생성 및 조회 기능을 제공하는 비즈니스 로직을 구현하기 위함.
 - 이 클래스는 이슈 데이터의 유효성 검증을 수행하고, 정렬된 이슈 목록을 클라이언트에 제공하며,
 - 이슈 생성 시 이메일 알림 등의 부가 기능을 지원하여 이슈 관리 프로세스의 안정성과 효율성을 높이는 데 기여함.
 * 참고 :
 - 이미지 다운로드 또는 조회 기능 확장 시 본 서비스의 저장 경로를 기반으로 구현
 * 수정사항:
 1. 수정자 / 일자 : 최유진 / 2025년 08월 13일
 - 내용 : html escape 처리 추가
 2. 수정자 / 일자 : 한서흔 / 2025년 08월 26일
 - 내용 : issue 이미지 base64 인코딩 메소드 추가.
 3. 수정자 / 일자 : 한서흔 / 2025년 09월 04일
 - 내용 : 이미지 저장 주석 처리, 이미지 저장 경로 절차 수정
 */

package com.nnp.qsremit.service.noticeManagement;

import com.nnp.qsremit.Entity.notice.NoticeImgEntity;
import com.nnp.qsremit.Entity.notice.NoticeManagementEntity;
import com.nnp.qsremit.repository.noticeManagement.NoticeImageRepository;
import com.nnp.qsremit.service.util.HttpUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;

@Slf4j
@Service
public class NoticeImageService {

    private final NoticeImageRepository noticeImageRepository;
    private final HttpUtils httpUtils;
    private final Path uploadPath;

    public NoticeImageService(NoticeImageRepository noticeImageRepository, HttpUtils httpUtils) throws IOException {
        this.noticeImageRepository = noticeImageRepository;
        this.httpUtils = httpUtils;
        this.uploadPath = Paths.get(System.getProperty("user.dir"), "notice_images");
        Files.createDirectories(uploadPath);
    }

    public void saveNoticeImage(NoticeManagementEntity notice, MultipartFile image) throws IOException {
        log.info("이미지 저장 시작 - 공지 번호: {}", notice.getNoticeNumber());

        if (image.isEmpty()) throw new IOException("빈 이미지 파일은 저장할 수 없습니다.");

        Long noticeNumber = notice.getNoticeNumber();
        String originalName = httpUtils.htmlEscape(image.getOriginalFilename());

        String extension = "";
        int dotIndex = originalName.lastIndexOf(".");
        if (dotIndex != -1) {
            extension = originalName.substring(dotIndex);
        }

        String timestamp = String.valueOf(System.currentTimeMillis());
        String uniqueName = "noticeManagement"+"_"+noticeNumber + "_" + timestamp + extension;

        if (!Files.exists(uploadPath)) {
            log.info("파일 저장 경로를 새로 생성합니다.");
            Files.createDirectories(uploadPath);
        }
        Path path = uploadPath.resolve(uniqueName);
        image.transferTo(path.toFile());
        log.info("파일 저장 경로: {}", path);


        NoticeImgEntity imageEntity = NoticeImgEntity.builder()
                .originalFileName(originalName)
                .fileName(uniqueName)
                .filePath(path.toString())
                .userEntity(notice.getUserId())
                .tempId(noticeNumber)
                .build();

        noticeImageRepository.save(imageEntity);
        log.info("이미지 엔티티 저장 완료 - 이슈 번호: {}, 파일명: {}", noticeNumber, uniqueName);
    }

    public void deleteNoticeImage(Long imageId) {
        NoticeImgEntity image = noticeImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("이미지를 찾을 수 없습니다: " + imageId));

        try {
            Path imagePath = Paths.get(image.getFilePath());
            Files.deleteIfExists(imagePath);
        } catch (IOException e) {
            throw new RuntimeException("이미지 파일 삭제 중 오류 발생: " + e.getMessage());
        }

        noticeImageRepository.deleteById(imageId);
    }

    public List<NoticeImgEntity> getNoticeImagesByNoticeId(Long issueId) {
        return noticeImageRepository.findByTempId(issueId);
    }

    public String getImageAsBase64(NoticeImgEntity image) {
        try {
            Path imagePath = Paths.get(image.getFilePath());
            byte[] imageBytes = Files.readAllBytes(imagePath);
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            // 이미지 타입 확인
            String extension = "";
            int dotIndex = image.getFileName().lastIndexOf(".");
            if (dotIndex != -1) {
                extension = image.getFileName().substring(dotIndex + 1).toLowerCase();
            }

            // 적절한 MIME 타입 설정
            String mimeType = switch (extension) {
                case "png" -> "image/png";
                case "gif" -> "image/gif";
                default -> "image/jpeg";
            };

            return "data:" + mimeType + ";base64," + base64Image;
        } catch (IOException e) {
            throw new RuntimeException("이미지 로드 중 오류 발생: " + e.getMessage());
        }
    }
    public String getThumbnailAsBase64(String fileName) {
        if(fileName == null || fileName.isEmpty()) return null;
        try {
            Path path = uploadPath.resolve(fileName);
            byte[] imageBytes = Files.readAllBytes(path);
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

            String mimeType = switch (extension) {
                case "png" -> "image/png";
                case "gif" -> "image/gif";
                default -> "image/jpeg";
            };

            return "data:" + mimeType + ";base64," + base64Image;

        } catch (IOException e) {
            throw new RuntimeException("썸네일 로드 중 오류 발생: " + e.getMessage());
        }
    }

    public String saveThumbnailImage(NoticeManagementEntity notice, MultipartFile thumbnail) throws IOException {

        if (thumbnail.isEmpty()) {
            throw new IOException("빈 썸네일 파일은 저장할 수 없습니다.");
        }

        Long noticeNumber = notice.getNoticeNumber();
        String originalName = httpUtils.htmlEscape(thumbnail.getOriginalFilename());
        String extension = extractExtension(originalName);
        String uniqueName = "thumbnail_" + noticeNumber + "_" + System.currentTimeMillis() + extension;

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path savePath = uploadPath.resolve(uniqueName);

        thumbnail.transferTo(savePath.toFile());

        NoticeImgEntity imageEntity = NoticeImgEntity.builder()
                .originalFileName(originalName)
                .fileName(uniqueName)
                .filePath(savePath.toString())
                .userEntity(notice.getUserId())
                .tempId(noticeNumber)
                .build();

        noticeImageRepository.save(imageEntity);

        return uniqueName;
    }

//     파일명에서 확장자를 추출합니다.

    private String extractExtension(String fileName) {
        if (fileName == null) return "";
        int dotIndex = fileName.lastIndexOf(".");
        return (dotIndex != -1) ? fileName.substring(dotIndex) : "";
    }

    //고유한 파일명을 생성합니다.

    private String generateUniqueFileName(String prefix, Long noticeNumber, String extension) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        return prefix + "_" + noticeNumber + "_" + timestamp + extension;
    }


//     디렉토리가 존재하지 않으면 생성합니다.

    private void ensureDirectoryExists(Path directory) throws IOException {
        if (!Files.exists(directory)) {
            log.info("파일 저장 경로를 새로 생성합니다: {}", directory);
            Files.createDirectories(directory);
        }
    }

//     파일을 지정된 디렉토리에 저장합니다.

    private Path saveFile(MultipartFile file, Path directory, String fileName) throws IOException {
        Path filePath = directory.resolve(fileName);
        file.transferTo(filePath.toFile());
        return filePath;
    }

    // 썸네일파일 삭제

    public void deleteThumbnailFile(String fileName) {
        try {
            Path thumbnailDir = Paths.get(uploadPath.getParent().toString(), "notice_thumbnail");
            Path filePath = thumbnailDir.resolve(fileName);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("썸네일 파일 삭제 완료: {}", fileName);
            } else {
                log.warn("삭제할 썸네일 파일을 찾을 수 없습니다: {}", fileName);
            }

        } catch (IOException e) {
            log.error("썸네일 파일 삭제 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("썸네일 파일 삭제 중 오류 발생: " + e.getMessage());
        }
    }

}
