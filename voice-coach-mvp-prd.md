# PRD: Voice Coach MVP

## 1. ภาพรวมผลิตภัณฑ์

**ชื่อชั่วคราว:** Voice Coach AI  
**ประเภท:** Web application สำหรับบันทึก/อัปโหลดเสียง วิเคราะห์การพูด และให้คำแนะนำเฉพาะตามบริบทการใช้งาน

Voice Coach AI เป็น copilot สำหรับฝึกพูด โดยวิเคราะห์ทั้ง **เสียง** (ความเร็ว พลังเสียง จังหวะ การหยุด น้ำเสียง) และ **เนื้อหา** (ความชัดเจน ความกระชับ คำฟุ่มเฟือย โครงสร้าง สำนวน) แล้วแสดงผลเป็นคะแนน คำแนะนำ และเรดาร์กราฟตาม preset coaching ที่ผู้ใช้เลือก

## 2. ปัญหา

ผู้ใช้ที่ต้องรายงานประชุม พูดต่อสาธารณะ เป็นพิธีกร สอนงาน หรือ pitch งาน มักไม่ทราบว่าปัญหาเกิดจากเสียง เนื้อหา หรือโครงสร้างการพูด และขาด feedback ที่วัดผลซ้ำได้

เครื่องมือทั่วไปมักให้ feedback แบบเดียวกันทุกสถานการณ์ ขณะที่เกณฑ์ของการรายงานประชุมแตกต่างจากพิธีกร การสอน หรือการโน้มน้าวใจ

## 3. เป้าหมาย MVP

1. ให้ผู้ใช้ส่งไฟล์เสียงพร้อม transcript หรือวาง transcript ได้
2. ให้ผู้ใช้เลือก preset เพื่อเปลี่ยนเกณฑ์การวิเคราะห์
3. วิเคราะห์ metric เสียงพื้นฐานและข้อความ
4. สร้างคะแนน 5 มิติ, คะแนนรวม, และเรดาร์กราฟ
5. ให้ AI feedback ภาษาไทยที่เฉพาะเจาะจงและนำไปฝึกได้ทันที
6. บันทึกประวัติการวิเคราะห์เพื่อเปรียบเทียบพัฒนาการในอนาคต

## 4. นอกขอบเขต MVP

- การ coach แบบ real-time ระหว่างสนทนา
- Video/facial expression analysis
- การระบุตัวตนจากเสียง หรือวิเคราะห์สุขภาพ/โรคจากเสียง
- Social sharing, marketplace ของโค้ช, ทีม/องค์กรหลายผู้ใช้
- การสร้างเสียงสังเคราะห์หรือ voice cloning
- การให้คะแนนที่ใช้ตัดสินผลการจ้างงานหรือประเมินบุคลากรอย่างอัตโนมัติ

## 5. กลุ่มผู้ใช้เป้าหมาย

| กลุ่มผู้ใช้ | งานที่ต้องทำ | คุณค่าที่ต้องการ |
|---|---|---|
| บุคลากรภาครัฐ/องค์กร | รายงานประชุม ชี้แจงข้อมูล | กระชับ เป็นทางการ มีข้อสรุปและ action items |
| วิทยากร/ผู้สอน | บรรยาย อธิบายเนื้อหา | ผู้ฟังตามทัน มีตัวอย่างและการทวนประเด็น |
| พิธีกร/Content creator | ดำเนินรายการ คลิปพูด | ลื่นไหล มีพลัง ดึงความสนใจ |
| ผู้สมัครงาน/ผู้บริหาร | สัมภาษณ์หรือ pitch | มั่นใจ มีโครงสร้าง เน้นคุณค่า |

## 6. User stories

- ในฐานะผู้ฝึกพูด ฉันต้องการเลือก preset เพื่อให้คำแนะนำเหมาะกับสถานการณ์จริง
- ในฐานะผู้ใช้ ฉันต้องการอัปโหลดเสียงหรือวาง transcript เพื่อรับผลวิเคราะห์อย่างรวดเร็ว
- ในฐานะผู้รายงานประชุม ฉันต้องการรู้ว่าสิ่งที่พูดขาดข้อมูล สรุป หรือ action item ตรงไหน
- ในฐานะพิธีกร ฉันต้องการรู้ว่าช่วงใดพลังเสียงตกหรือคำเชื่อมซ้ำ
- ในฐานะผู้เรียน ฉันต้องการเห็นเรดาร์กราฟและคะแนน เพื่อรู้จุดแข็งและจุดที่ควรฝึก
- ในฐานะผู้ใช้ประจำ ฉันต้องการดูผลครั้งก่อนเพื่อเปรียบเทียบพัฒนาการ

## 7. Preset coaching ใน MVP

| Preset | เป้าหมาย | มิติเรดาร์ 5 ด้าน | เป้าหมายสำคัญ |
|---|---|---|---|
| การประชุม/รายงาน | ชัด กระชับ เป็นทางการ | ความกระชับ, ข้อมูลครบ, ความเป็นทางการ, โครงสร้าง, ควบคุมคำฟุ่มเฟือย | เปิดวัตถุประสงค์, ข้อมูลสนับสนุน, สรุป action items |
| พูดต่อหน้าชุมชน | ดึงดูดและน่าจดจำ | พลังเสียง, เปิดดึงดูด, เรื่องเล่า, การมีส่วนร่วม, ทิ้งท้ายชัด | hook, energy, audience engagement, CTA |
| พิธีกร | คุม flow และบรรยากาศ | ความลื่นไหล, คุมเวลา, พลังสม่ำเสมอ, คำเชื่อม, ดึงผู้ฟัง | transition, timing, recovery เมื่อสะดุด |
| สัมภาษณ์งาน | มั่นใจ กระชับ มีคุณค่า | ความมั่นใจ, โครงสร้าง STAR, เน้นคุณค่า, ความกระชับ, ควบคุมคำฟุ่มเฟือย | STAR, evidence, positive language |
| การสอน/บรรยาย | ให้ผู้ฟังเข้าใจและตามทัน | ความเร็วเหมาะสม, signposting, ตรวจความเข้าใจ, ตัวอย่าง, ทวนสรุป | pacing, examples, recap |
| Pitching/โน้มน้าวใจ | ทำให้ผู้ฟังเชื่อและตัดสินใจ | พลังเชื่อมั่น, ปัญหา-ทางแก้, ประโยชน์, ความเร่งด่วน, ภาษามั่นใจ | problem-solution, benefits, CTA |

> MVP เริ่มเปิดใช้ 3 preset แรก: การประชุม/รายงาน, พูดต่อหน้าชุมชน, และพิธีกร ส่วน preset อื่นเปิดด้วย feature flag หลังทดสอบคุณภาพ feedback

## 8. Functional requirements

### 8.1 รับข้อมูล

- รองรับไฟล์ `wav`, `mp3`, `m4a`, `webm` สูงสุด 10 นาที/ไฟล์ใน MVP
- ผู้ใช้เลือก preset ก่อนวิเคราะห์
- ผู้ใช้วาง transcript เองได้ หรือเลือกให้ระบบถอดเสียงอัตโนมัติเมื่อเปิดใช้ STT
- แสดงสถานะ upload, processing, completed, failed

### 8.2 การวิเคราะห์เสียง

ระบบคำนวณอย่างน้อย:

- ระยะเวลาเสียง
- คำต่อนาที (WPM) โดยอิง transcript และระยะเวลา
- พลังเสียงเฉลี่ยและความแปรปรวน (RMS energy)
- Pitch เฉลี่ยและความแปรปรวน (F0/pitch variation)
- จำนวนและระยะเวลาช่วงเงียบ (pause)
- ช่วงที่ระดับพลังเสียงต่ำ/สูงผิดจากเป้าหมาย

### 8.3 การวิเคราะห์เนื้อหา

ระบบตรวจ:

- คำฟุ่มเฟือย เช่น “เอ่อ”, “อ่า”, “แบบว่า”, “คือว่า” พร้อมจำนวนและ timestamp หาก transcript มีเวลา
- ความยาวประโยค และประโยคที่ยาวหรือซับซ้อนเกินเกณฑ์
- คำหรือวลีซ้ำ
- โครงสร้างเนื้อหาให้สอดคล้อง preset เช่น เปิดเรื่อง-ประเด็นหลัก-สรุป หรือ problem-solution-CTA
- ความชัดเจนและระดับภาษา (เป็นทางการ/สนทนา) ตาม preset
- ข้อเสนอปรับสำนวน พร้อมตัวอย่างก่อน-หลัง

### 8.4 AI coach feedback

- สร้าง feedback เป็นภาษาไทย
- แสดงคะแนนมิติละ 0-100 และเหตุผลสั้น
- แสดงจุดแข็ง 2-3 ข้อ, จุดปรับปรุงที่สำคัญไม่เกิน 3 ข้อ, แบบฝึกหัด 1-2 ข้อ
- ทุกคำแนะนำต้องผูกกับหลักฐาน เช่น metric, คำที่ตรวจพบ หรือส่วนหนึ่งของ transcript
- หลีกเลี่ยงการอ้างว่า “วินิจฉัยบุคลิกภาพ/สุขภาพ” จากเสียง

### 8.5 Dashboard ผลลัพธ์

- แสดงคะแนนรวม 0-100
- แสดงเรดาร์กราฟ 5 มิติตาม preset
- แสดง metrics ดิบ: WPM, duration, fillers, pause, energy, pitch variation
- แสดงรายการ feedback ลำดับความสำคัญสูงสุด
- แสดง transcript ที่ highlight filler words และจุดที่ควรปรับ (ระยะ MVP สามารถ highlight เฉพาะคำ)
- ดาวน์โหลดผลเป็น Markdown หรือ JSON ได้

### 8.6 ประวัติ

- บันทึก: วันเวลา, preset, transcript, คะแนน, metrics, feedback, ชื่อไฟล์ (ไม่จำเป็นต้องเก็บ raw audio)
- ผู้ใช้ดูรายการย้อนหลังและเปรียบเทียบคะแนนรวมตามเวลาได้

## 9. Scoring model

คะแนนต้องเป็น **คะแนนเพื่อการฝึกฝน** ไม่ใช่ค่าความจริงสัมบูรณ์ และต้องบอกเหตุผลประกอบทุกครั้ง

### 9.1 สูตรระดับระบบ

```text
Final Score = 0.40 x Acoustic Score + 0.35 x Content Score + 0.25 x Preset Fit Score
```

- Acoustic Score: pace, energy, pitch variation, pause
- Content Score: fillers, ความยาวประโยค, คำซ้ำ, readability
- Preset Fit Score: checklist ตาม preset ที่ LLM วิเคราะห์จาก transcript และ metrics

### 9.2 หลักการแปลงคะแนน

- แต่ละ preset มี target range และ weight แยกกัน
- ค่าที่อยู่ใน target range ได้คะแนนสูง ไม่ควรให้ 100 แบบตายตัว
- คะแนนที่ได้จาก heuristic ต้องแยกแสดงจากคะแนนที่ LLM ประเมิน
- LLM คืน structured JSON เพื่อป้องกันลำดับเรดาร์กับคะแนนคลาดเคลื่อน

### 9.3 ตัวอย่าง target WPM

| Preset | เป้าหมาย WPM |
|---|---:|
| การประชุม/รายงาน | 100-140 |
| พูดต่อหน้าชุมชน | 120-160 |
| พิธีกร | 130-170 |
| สัมภาษณ์งาน | 110-140 |
| การสอน/บรรยาย | 100-130 |
| Pitching | 130-170 |

> ค่าเป้าหมายเป็นค่าเริ่มต้น ต้องปรับจากข้อมูลผู้ใช้จริงและผลการทดสอบ ไม่ควรตีความว่าเป็นมาตรฐานตายตัวของทุกคนหรือทุกภาษา

## 10. LLM output contract

LLM ต้องตอบเป็น JSON ที่ parse ได้ตาม schema นี้:

```json
{
  "overall_score": 0,
  "dimension_scores": [
    {"key": "energy", "label": "พลังเสียง", "score": 0, "reason": "..."}
  ],
  "strengths": ["..."],
  "priorities": [
    {
      "title": "...",
      "evidence": "...",
      "impact": "high",
      "recommendation": "...",
      "exercise": "..."
    }
  ],
  "content_rewrites": [
    {"original": "...", "improved": "...", "reason": "..."}
  ],
  "practice_plan": ["..."],
  "limitations": ["ประเมินจากไฟล์เสียงและ transcript ที่ให้มา"]
}
```

กติกา prompt:

- ใช้หลักฐานจาก transcript และ metrics ที่ส่งให้เท่านั้น
- ห้ามเดาอายุ เพศ เชื้อชาติ สุขภาพ หรือบุคลิกภาพ
- ห้ามใช้คะแนนเดียวกันคนละความหมายข้าม preset
- ต้องส่ง dimension keys ตาม preset ที่เลือกและตามลำดับที่ backend กำหนด

## 11. User flow

1. ผู้ใช้เปิดหน้า Dashboard
2. เลือก preset
3. อัปโหลดไฟล์เสียง หรือกดบันทึกเสียงผ่าน browser
4. วาง transcript หรือเลือก “ถอดเสียงอัตโนมัติ”
5. กด “วิเคราะห์การพูด”
6. Backend วิเคราะห์เสียง, วิเคราะห์ข้อความ, เรียก LLM และคำนวณคะแนน
7. ผู้ใช้เห็นคะแนนรวม, radar chart, metrics, feedback และแบบฝึกหัด
8. ผู้ใช้บันทึกผลหรือ export Markdown

## 12. UX requirements

- หน้าแรกต้องทำงานได้ในไม่เกิน 3 ขั้นตอนก่อนเริ่มวิเคราะห์
- ใช้ภาษาไทยเป็นค่าเริ่มต้น; UI รองรับอังกฤษในอนาคต
- ผลลัพธ์ต้องแยก “สิ่งที่วัดได้” กับ “คำแนะนำของ AI” ชัดเจน
- Radar chart ต้องแสดงชื่อมิติที่สัมพันธ์กับ preset และ tooltip อธิบายคะแนน
- Feedback บนหน้าผลลัพธ์ไม่เกิน 3 เรื่องสำคัญก่อน ผู้ใช้กดดูรายละเอียดเพิ่มได้
- รองรับมือถือและเดสก์ท็อป

## 13. Technical architecture

```text
Browser (React/Next.js)
  -> Upload/Record Audio + Transcript
FastAPI Backend
  -> Object storage (audio; optional, short retention)
  -> Audio Analyzer (librosa / ffmpeg)
  -> STT (Whisper API or local Whisper; optional in MVP phase 1)
  -> Thai NLP (PyThaiNLP + rules)
  -> Scoring Engine (preset config + heuristic)
  -> LLM Adapter (structured JSON feedback)
  -> PostgreSQL (analysis history)
  -> API response
Frontend Dashboard (Chart.js radar chart)
```

### Suggested stack

- Frontend: Next.js + TypeScript + Tailwind CSS + Chart.js
- Backend: FastAPI + Pydantic
- Audio: FFmpeg, librosa, NumPy
- Thai NLP: PyThaiNLP
- Database: PostgreSQL; SQLite สำหรับ local prototype
- Queue: FastAPI BackgroundTasks ใน MVP, เปลี่ยนเป็น Celery/RQ เมื่อไฟล์จำนวนมาก
- Storage: local disk สำหรับ development; S3-compatible storage สำหรับ production
- LLM: provider abstraction รองรับ OpenAI/Anthropic หรือโมเดลที่เลือกภายหลัง

## 14. API scope

| Method | Endpoint | หน้าที่ |
|---|---|---|
| GET | `/api/v1/presets` | ดึง preset และเกณฑ์เป้าหมาย |
| POST | `/api/v1/analyses` | อัปโหลดเสียง + transcript + preset เพื่อเริ่มวิเคราะห์ |
| GET | `/api/v1/analyses/{id}` | ดูผลวิเคราะห์และสถานะ |
| GET | `/api/v1/analyses` | ดูประวัติของผู้ใช้ |
| GET | `/api/v1/analyses/{id}/export.md` | ดาวน์โหลดรายงาน Markdown |
| POST | `/api/v1/transcriptions` | ถอดเสียง (เปิดใช้ภายหลังได้) |

### Request: `POST /api/v1/analyses`

```json
{
  "preset": "meeting",
  "transcript": "...",
  "language": "th",
  "audio_file": "multipart/form-data"
}
```

### Response (ย่อ)

```json
{
  "id": "analysis_01",
  "status": "completed",
  "preset": "meeting",
  "overall_score": 78,
  "radar": {
    "labels": ["ความกระชับ", "ข้อมูลครบ", "ความเป็นทางการ", "โครงสร้าง", "ควบคุมคำฟุ่มเฟือย"],
    "values": [82, 70, 86, 75, 79]
  },
  "metrics": {"wpm": 132, "duration_sec": 185, "filler_count": 4},
  "feedback": {"strengths": [], "priorities": [], "practice_plan": []}
}
```

## 15. Data model

### Analysis

```text
Analysis
- id: UUID
- user_id: UUID (nullable for guest MVP)
- created_at: datetime
- preset_key: string
- language: string
- transcript: text
- audio_uri: string (nullable; encrypted/short retention)
- duration_sec: float
- audio_metrics: JSONB
- content_metrics: JSONB
- dimension_scores: JSONB
- overall_score: numeric
- llm_feedback: JSONB
- model_metadata: JSONB
- status: queued | processing | completed | failed
- error_message: string (nullable)
```

## 16. Non-functional requirements

- ประมวลผลไฟล์ยาวไม่เกิน 5 นาทีให้เสร็จภายใน 90 วินาทีในสภาวะปกติ (ไม่รวมกรณี provider ล่ม)
- รองรับไฟล์สูงสุด 10 นาที/100 MB ใน MVP
- เก็บ API keys ใน environment variables หรือ secret manager เท่านั้น
- บังคับตรวจชนิดไฟล์, ขนาดไฟล์, และ scan ความปลอดภัยก่อนประมวลผล
- บันทึก error และ request ID โดยไม่บันทึก raw audio ใน log
- ผลลัพธ์ LLM ต้อง validate ด้วย Pydantic schema; หาก parse ไม่ได้ให้ retry 1 ครั้งหรือส่ง fallback feedback

## 17. Privacy and safety

- แจ้งชัดเจนก่อนอัปโหลดว่าเสียงและ transcript อาจถูกส่งไปยังผู้ให้บริการ STT/LLM ตามการตั้งค่า
- ให้ผู้ใช้เลือก “ไม่เก็บไฟล์เสียงหลังวิเคราะห์” เป็นค่าเริ่มต้น
- กำหนด retention ของ raw audio เช่น ลบภายใน 24 ชั่วโมง; เก็บเฉพาะ metrics และ feedback หากผู้ใช้ยินยอม
- มีปุ่มลบผลวิเคราะห์และข้อมูลที่เกี่ยวข้อง
- ไม่ใช้ข้อมูลเสียงเพื่อฝึกโมเดลโดยไม่ได้รับความยินยอมอย่างชัดแจ้ง
- แสดง disclaimer: ผลเป็นเครื่องมือฝึกการสื่อสาร ไม่ใช่การประเมินสุขภาพ จิตวิทยา หรือสมรรถนะในการทำงาน

## 18. Analytics ที่ต้องเก็บ

- จำนวน analysis ต่อวัน/ต่อ preset
- อัตราสำเร็จและเวลาประมวลผลรายขั้นตอน
- อัตราการใช้ STT เทียบกับ transcript ที่ผู้ใช้วางเอง
- คะแนนเฉลี่ยตาม preset แบบไม่ระบุตัวตน
- อัตราการกลับมาวิเคราะห์ซ้ำภายใน 7 วัน
- Feedback helpfulness (thumb up/down) และเหตุผล

## 19. Success metrics

### Product

- ผู้ใช้ใหม่อย่างน้อย 60% ทำ analysis สำเร็จครั้งแรก
- เวลาเริ่มต้นถึงผลลัพธ์ median ไม่เกิน 90 วินาทีสำหรับไฟล์ 5 นาที
- ผู้ใช้ที่ดูผลแล้วอย่างน้อย 40% กลับมาวิเคราะห์ซ้ำภายใน 14 วัน
- Feedback helpfulness ได้ positive rating อย่างน้อย 70%

### Quality

- Structured LLM response parse สำเร็จอย่างน้อย 98%
- Radar labels และ score keys ตรงกับ preset 100%
- ระบบตรวจจับ filler words ในชุดทดสอบภาษาไทยตามรายการที่กำหนดได้อย่างน้อย 90%
- ไม่มี feedback ที่อ้างการวินิจฉัยสุขภาพ/บุคลิกภาพจากเสียงในชุดทดสอบ safety

## 20. Acceptance criteria

### การวิเคราะห์

- ผู้ใช้เลือกหนึ่งใน 3 MVP presets แล้วระบบส่งผลที่ใช้ labels ตาม preset นั้น
- เมื่ออัปโหลดไฟล์พร้อม transcript ระบบคำนวณ duration, WPM, energy, pitch variation, pauses และ filler count
- ระบบแสดง 5 score values ระหว่าง 0-100 พร้อม radar chart
- LLM feedback ต้องประกอบด้วย strengths, priorities, recommendation และ practice plan
- หาก LLM ล้มเหลว ระบบยังแสดง metric และ feedback rule-based ขั้นพื้นฐานได้

### คุณภาพเนื้อหา

- สำหรับ preset การประชุม ระบบต้องตรวจการมี/ไม่มี: วัตถุประสงค์, ประเด็นหลัก, ข้อสรุป/action item
- สำหรับ preset พูดต่อหน้าชุมชน ระบบต้องตรวจ hook, ตัวอย่าง/เรื่องเล่า, การชวนมีส่วนร่วม และ CTA
- สำหรับ preset พิธีกร ระบบต้องตรวจคำเชื่อม, flow และช่วงพลังเสียงตกจาก metric ที่วัดได้

### ความปลอดภัย

- ไฟล์ที่ไม่ใช่ audio หรือเกินขนาดต้องถูกปฏิเสธ
- API key ไม่ปรากฏใน frontend, response หรือ logs
- ผู้ใช้สามารถลบ analysis ของตนเองได้

## 21. Roadmap

### Phase 0: Prototype (1 สัปดาห์)

- Upload wav/mp3 + transcript manual
- 3 presets
- Audio metrics ด้วย librosa และ rule-based Thai filler detector
- FastAPI endpoint และหน้า dashboard อย่างง่าย
- Radar chart จาก heuristic score

### Phase 1: MVP (2-4 สัปดาห์)

- Login หรือ guest session
- STT ภาษาไทยแบบ optional
- LLM structured feedback
- History, export Markdown, delete data
- Monitoring, validation, rate limiting

### Phase 2: Improve quality

- Timestamp alignment ระหว่าง transcript กับเสียง
- ชี้ช่วงเสียงที่ควรฝึกบน waveform/transcript
- Personal baseline และกราฟพัฒนาการ
- เพิ่ม preset interview, teaching, pitching
- A/B test weights และ prompt ของแต่ละ preset

### Phase 3: Advanced

- Practice mode: โจทย์พูด, timer, repeat drills
- Real-time low-latency feedback แบบ opt-in
- องค์กร/ทีม, rubric ที่ผู้ดูแลกำหนดเอง
- RAG สำหรับ rubric การนำเสนอเฉพาะองค์กร โดยคำนึงถึงความเป็นส่วนตัว

## 22. ความเสี่ยงและแนวทางลดความเสี่ยง

| ความเสี่ยง | ผลกระทบ | แนวทาง |
|---|---|---|
| STT ภาษาไทยผิด ทำให้วิเคราะห์เนื้อหาผิด | Feedback ไม่น่าเชื่อถือ | ให้ผู้ใช้แก้ transcript ก่อนวิเคราะห์ และแสดง confidence |
| RMS/pitch ต่างกันตามไมค์และสภาพแวดล้อม | คะแนนเสียงไม่เสถียร | normalize ต่อไฟล์, ใช้ personal baseline, ไม่ใช้ threshold แข็งเกินไป |
| LLM ให้ feedback กว้างหรือแต่งหลักฐาน | คุณภาพต่ำ | ส่ง metrics แบบมีโครงสร้าง, กำหนด JSON schema, บังคับ evidence, validation/fallback |
| ความเป็นส่วนตัวของเสียง | ความเชื่อมั่นและ compliance | retention สั้น, consent, ลบได้, encryption และไม่เก็บใน log |
| ผู้ใช้ตีความคะแนนเป็นการตัดสินคุณค่า | ผลกระทบด้านจิตใจ/การงาน | disclaimer, แสดงว่าเป็น coaching score และอธิบายข้อจำกัด |
| ค่าใช้จ่าย LLM/STT สูง | ขยายระบบยาก | จำกัดความยาว, cache, text-only mode, quota และ provider abstraction |

## 23. คำถามเปิดก่อนเริ่มพัฒนา

1. MVP จะเน้นเว็บ responsive ก่อน หรือทำเป็น Android app ตั้งแต่แรก?
2. จะเริ่มด้วย transcript ที่ผู้ใช้วางเองเพื่อลดต้นทุน/ความซับซ้อน หรือเปิด STT ตั้งแต่วันแรก?
3. ต้องการให้เก็บ raw audio หรือเก็บเฉพาะผลวิเคราะห์เป็นค่าเริ่มต้น?
4. จะใช้ LLM provider ใดเป็นหลัก และมีข้อจำกัดข้อมูลราชการ/ข้อมูลอ่อนไหวหรือไม่?
5. ต้องการ rubrics ของ “การรายงานการประชุม” ให้สอดคล้องคู่มือ/มาตรฐานของหน่วยงานเฉพาะหรือไม่?

---

## ภาคผนวก: Prompt boundary สำหรับ LLM

```text
วิเคราะห์เพื่อการฝึกการสื่อสารเท่านั้น ใช้ข้อมูล transcript และ metrics ที่ได้รับเป็นหลักฐาน
ห้ามอนุมานเพศ อายุ เชื้อชาติ สุขภาพ สภาวะจิตใจ บุคลิกภาพ หรือความสามารถในการทำงานจากเสียง
ห้ามเสนอคำแนะนำทางการแพทย์หรือการบำบัดเสียง
หากข้อมูลไม่เพียงพอ ให้ระบุข้อจำกัดอย่างชัดเจน
ให้คำแนะนำที่สังเกตได้ ปฏิบัติได้ และสัมพันธ์กับ preset ที่เลือก
```
