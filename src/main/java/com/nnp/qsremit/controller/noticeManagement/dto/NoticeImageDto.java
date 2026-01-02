package com.nnp.qsremit.controller.noticeManagement.dto;

import com.nnp.qsremit.Entity.notice.NoticeImgEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeImageDto {
    private String originalFileName;
    private String fileName;
    private String base64Data;

    public static NoticeImageDto from(NoticeImgEntity entity) {
        return NoticeImageDto.builder()
                .originalFileName(entity.getOriginalFileName())
                .fileName(entity.getFileName())
                .build();
    }
}
