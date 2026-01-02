package com.nnp.qsremit.controller.noticeManagement.dto.request;

import com.nnp.qsremit.Entity.notice.NoticeManagementEntity;
import com.nnp.qsremit.Entity.user.UserEntity;
import com.nnp.qsremit.validation.annotation.NoAngleBrackets;
import com.nnp.qsremit.validation.annotation.SafeQuillHtml;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class createNoticeRequestDto {

    @NoAngleBrackets
    String title;

    @SafeQuillHtml
    String description;

    public NoticeManagementEntity toEntity(createNoticeRequestDto dto, UserEntity user, Long noticeId) {
        return NoticeManagementEntity.builder()
                .title(dto.title)
                .noticeNumber(noticeId)
                .description(dto.description)
                .userId(user)
                .createDate(OffsetDateTime.now())
                .build();
    }
}