/**
 * 개발자 : 채호정
 * 개발일 : 2025년 04월 08월
 * 개발목적 :인증된 사용자 정보를 기반으로 이슈 생성 및 조회 기능을 제공하는 비즈니스 로직을 구현하기 위함.
 *   이 클래스는 이슈 데이터의 유효성 검증을 수행하고, 정렬된 이슈 목록을 클라이언트에 제공하며,
 *   이슈 생성 시 이메일 알림 등의 부가 기능을 지원하여 이슈 관리 프로세스의 안정성과 효율성을 높이는 데 기여함.
 * 참고 :
 * 수정사항:
 1. 수정자 / 일자 : 채호정 / 2025년 04월 08월
 - 내용 : createIssueManagement() 메서드 추가
 2. 수정자 / 일자 : 채호정 / 2025년 04월 09월
 - 내용 : 이슈 관리 service 로직 구현
 3. 수정자 / 일자 : 김연주 / 2025년 07월 04월
 - 내용 : getIssueList 메서드에 날짜 범위 파라미터 추가 및 기간별 이슈 조회 적용 / 이슈 작성, 완료시 메일 전송
 4. 수정자 / 일자 : 김연주 / 2025년 07월 08월
 - 내용 : 이슈 상태 COMPLETED 로 업데이트시 조건 추가
 5. 수정자 / 일자 : 김연주 / 2025년 07월 13월
 - 내용 : 담당자 선택시 개발자 계정으로  메일 전송
 6. 수정자 / 일자 : 최유진 / 2025년 08월 13일
 - 내용 : html escape 처리 추가
 7. 수정자 / 일자 : 한서흔 / 2025년 08월 26일
 - 내용 : createIssueManagement, updateIssue 메소드 수정.
 8. 수정자 / 일자 : 김연주 / 2025년 11월 02일
 - 내용 : 이슈 생성 트랜잭션 경계 및 afterCommit 처리 안정화
 */
package com.nnp.qsremit.service.noticeManagement;

import com.nnp.qsremit.Entity.notice.NoticeImgEntity;
import com.nnp.qsremit.Entity.notice.NoticeManagementEntity;
import com.nnp.qsremit.Entity.user.UserEntity;
import com.nnp.qsremit.controller.noticeManagement.dto.request.createNoticeRequestDto;
import com.nnp.qsremit.controller.noticeManagement.dto.request.updateNoticeRequestDto;
import com.nnp.qsremit.controller.noticeManagement.dto.response.NoticeListResponseDto;
import com.nnp.qsremit.service.util.HttpUtils;
import com.nnp.qsremit.service.verification.NoticeManagementVerificationService;
import com.nnp.qsremit.service.verification.UserVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class
NoticeManagementService {

    private final NoticeManagementVerificationService noticeManagementVerificationService;
    private final UserVerificationService userVerificationService;
    private final NoticeImageService noticeImageService;
    private final HttpUtils httpUtils;

    public List<NoticeListResponseDto> getNoticeList(String startDate, String endDate) {

        OffsetDateTime endDateTime = convertStringToOffsetDateTime(endDate, true);
        OffsetDateTime startDateTime = convertStringToOffsetDateTime(startDate, false);
        List<NoticeManagementEntity> entity = noticeManagementVerificationService.getRecentNotices(startDateTime, endDateTime);

        return entity.stream().map(NoticeListResponseDto::from).toList();
    }

    public List<NoticeListResponseDto> getNoticeList() {
        List<NoticeManagementEntity> entities = noticeManagementVerificationService.findAll();

        return entities.stream()
                .map(entity -> {
                    String thumbnailBase64 = null;
                    if (entity.getThumbnail() != null && !entity.getThumbnail().isEmpty()) {
                        thumbnailBase64 = noticeImageService.getThumbnailAsBase64(entity.getThumbnail());
                    }
                    List<NoticeImgEntity> images = noticeImageService.getNoticeImagesByNoticeId(entity.getNoticeNumber());
                    return NoticeListResponseDto.from(entity, images, thumbnailBase64);
                })
                .toList();
    }

    /**
     * 새로운 공지를 생성하고 저장합니다.
     * 이미지 검증 후 존재하면 saveNoticeImage 를 통해 이미지 저장을 합니다.
     * 모든 과정이 성공하면 마지막에 개발자에게 이메일을 전송합니다.
     */
    @Transactional
    public void createNoticeManagement(createNoticeRequestDto dto, MultipartFile thumbnail, List<MultipartFile> images, String name) {
        // 1. 사용자 조회
        UserEntity user = userVerificationService.findByUserId(name);

        // 2. 다음 이슈 번호 가져오기
        Long noticeId = noticeManagementVerificationService.getNextNoticeId();

        // 3. 내용 sanitize / escape 처리
        String originalContent = dto.getDescription();
        dto = (createNoticeRequestDto) httpUtils.escapeAllStrings(dto);
        dto.setDescription(httpUtils.sanitizeRelaxed(originalContent));

        // 4. 엔티티 변환 및 저장
        NoticeManagementEntity notice = dto.toEntity(dto, user, noticeId);
        noticeManagementVerificationService.save(notice);

        // 썸네일 처리
        if (thumbnail != null && !thumbnail.isEmpty()) {
            try {
                String saveThumb = noticeImageService.saveThumbnailImage(notice, thumbnail);
                notice.changeThumbnail(saveThumb);
                noticeManagementVerificationService.save(notice);
            } catch (IOException e) {
                throw new RuntimeException("썸네일 저장 중 오류 발생: " + e.getMessage());
            }
        }

        // 5. 첨부 이미지 처리
        if (images != null && !images.isEmpty()) {
            images.stream()
                    .filter(image -> image != null && !image.isEmpty())
                    .forEach(image -> {
                        try {
                            noticeImageService.saveNoticeImage(notice, image);
                        } catch (IOException e) {
                            throw new RuntimeException("공지 이미지 저장 중 오류 발생: " + e.getMessage());
                        }
                    });
        }
    }

    public NoticeListResponseDto getNoticeDetail(Long id) {
        NoticeManagementEntity entity = noticeManagementVerificationService.findByNoticeNumber(id);

        List<NoticeImgEntity> allImages = noticeImageService.getNoticeImagesByNoticeId(id);
        log.info("===== 공지 ID {} 이미지 조회 =====", id);
        log.info("전체 이미지 개수: {}", allImages.size());

        allImages.forEach(img -> {
            log.info("이미지 파일명: {}", img.getFileName());
        });

        List<NoticeImgEntity> images = allImages.stream()
                .filter(img -> img.getFileName().startsWith("noticeManagement_"))
                .toList();

        log.info("필터링 후 이미지 개수: {}", images.size());

        String thumbnailBase64 = null;
        if (entity.getThumbnail() != null && !entity.getThumbnail().isEmpty()) {
            log.info("썸네일 파일명: {}", entity.getThumbnail());
            thumbnailBase64 = noticeImageService.getThumbnailAsBase64(entity.getThumbnail());
            if (thumbnailBase64 != null && !thumbnailBase64.isEmpty()) {
                log.info("썸네일 Base64 변환 완료: {} bytes", thumbnailBase64.length());
            } else {
                log.warn("썸네일 Base64 변환 실패");
            }
        }

        return NoticeListResponseDto.from(entity, images, thumbnailBase64);
    }

    @Transactional
    public void updateNotice(Long noticeId, updateNoticeRequestDto dto, MultipartFile thumbnail, List<MultipartFile> images) {
        NoticeManagementEntity entity = noticeManagementVerificationService.findByNoticeNumber(noticeId);
//        boolean isAssignee = Objects.equals(entity.getAssignee(), dto.getAssignee());

        String originalContent = dto.getDescription();
        dto = (updateNoticeRequestDto) httpUtils.escapeAllStrings(dto);
        dto.setDescription(httpUtils.sanitizeRelaxed(originalContent));

        entity.updateFromDto(dto);

        String oldThumbnail = entity.getThumbnail();
        if (thumbnail != null && !thumbnail.isEmpty()) {
            try {
                String newThumbName = noticeImageService.saveThumbnailImage(entity, thumbnail);
                entity.changeThumbnail(newThumbName);
                noticeManagementVerificationService.save(entity);

                if (oldThumbnail != null && !oldThumbnail.isEmpty() && !Objects.equals(oldThumbnail, newThumbName)) {
                    noticeImageService.deleteThumbnailFile(oldThumbnail);
                }
            } catch (IOException e) {
                throw new RuntimeException("썸네일 이미지 저장 중 오류 발생: " + e.getMessage());
            }
        } else {
            noticeManagementVerificationService.save(entity);
        }

        // 기존 '본문' 이미지만 삭제 (파일명이 noticeManagement_ 로 시작하는 것만)
        List<NoticeImgEntity> existingImages = noticeImageService.getNoticeImagesByNoticeId(noticeId)
                .stream()
                .filter(img -> {
                    String fileName = img.getFileName();
                    return fileName != null && fileName.startsWith("noticeManagement_");
                })
                .toList();

        existingImages.forEach(img -> noticeImageService.deleteNoticeImage(img.getId()));


        log.info("===== 공지 ID {} 이미지 저장 =====", noticeId);
        log.info("받은 이미지 개수: {}", images != null ? images.size() : 0);

        if (images != null && !images.isEmpty()) {
            images.stream()
                    .filter(image -> image != null && !image.isEmpty())
                    .forEach(image -> {
                        try {
                            log.info("이미지 저장 중: {}, 크기: {} bytes", image.getOriginalFilename(), image.getSize());
                            noticeImageService.saveNoticeImage(entity, image);
                            log.info("이미지 저장 완료: {}", image.getOriginalFilename());
                        } catch (IOException e) {
                            log.error("본문 이미지 저장 실패: {}", e.getMessage());
                            throw new RuntimeException("본문 이미지 저장 중 오류 발생: " + e.getMessage());
                        }
                    });
            noticeManagementVerificationService.save(entity);
            log.info("이미지 저장 트랜잭션 완료");
        } else {
            log.info("저장할 이미지가 없습니다.");
        }
    }

    private static OffsetDateTime convertStringToOffsetDateTime(String dateString, boolean isEndOfDay) {
        LocalDate localDate = LocalDate.parse(dateString);

        if (isEndOfDay) {
            return localDate.atTime(23, 59, 59).atOffset(ZoneOffset.UTC); // 끝 시간
        } else {
            return localDate.atStartOfDay().atOffset(ZoneOffset.UTC); // 시작 시간
        }
    }

    @Transactional
    public void deleteNotice(Long noticeId) {

        //1. 공지 조회
        NoticeManagementEntity entity = noticeManagementVerificationService.findByNoticeNumber(noticeId);

        if(entity == null){
            throw new RuntimeException("공지사항을 찾을 수 없습니다: " + noticeId);
        }

        List<NoticeImgEntity> images = noticeImageService.getNoticeImagesByNoticeId(noticeId);
        for(NoticeImgEntity img : images){
            noticeImageService.deleteNoticeImage(img.getId());}

        //2. 공지 삭제
        noticeManagementVerificationService.delete(entity);
    }
}
