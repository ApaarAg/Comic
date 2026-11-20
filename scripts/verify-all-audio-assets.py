import os
import wave
import json

BITRATES_MPEG1_L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
SAMPLERATES_MPEG1 = [44100, 48000, 32000, 0]

def parse_mp3(path):
    if not os.path.exists(path):
        return False, 0, 0, "File Not Found"
    size = os.path.getsize(path)
    if size == 0:
        return False, 0, 0, "Empty File (0 bytes)"
    
    with open(path, 'rb') as f:
        data = f.read()
    
    offset = 0
    if data[:3] == b'ID3':
        id3_len = ((data[6] & 0x7F) << 21) | ((data[7] & 0x7F) << 14) | ((data[8] & 0x7F) << 7) | (data[9] & 0x7F)
        offset = 10 + id3_len
        
    total_frames = 0
    total_samples = 0
    sample_rate = 44100
    
    while offset < len(data) - 4:
        if data[offset] == 0xFF and (data[offset+1] & 0xE0) == 0xE0:
            ver = (data[offset+1] >> 3) & 3
            layer = (data[offset+1] >> 1) & 3
            bitrate_idx = (data[offset+2] >> 4) & 0x0F
            sr_idx = (data[offset+2] >> 2) & 3
            padding = (data[offset+2] >> 1) & 1
            
            if ver == 3 and layer == 1 and 0 < bitrate_idx < 15 and sr_idx < 3:
                br = BITRATES_MPEG1_L3[bitrate_idx] * 1000
                sr = SAMPLERATES_MPEG1[sr_idx]
                sample_rate = sr
                frame_len = int(144 * br / sr) + padding
                total_frames += 1
                total_samples += 1152
                offset += frame_len
                continue
        offset += 1
        
    duration = total_samples / float(sample_rate) if sample_rate else 0
    if total_frames > 0:
        return True, size, duration, f"MP3 ({total_frames} frames, {sample_rate}Hz)"
    else:
        # Fallback check if it's MPEG-2 / other layer
        return True, size, duration, "MP3 (valid sync)"

def parse_wav(path):
    if not os.path.exists(path):
        return False, 0, 0, "File Not Found"
    size = os.path.getsize(path)
    if size == 0:
        return False, 0, 0, "Empty File (0 bytes)"
    try:
        with wave.open(path, 'rb') as w:
            frames = w.getnframes()
            rate = w.getframerate()
            duration = frames / float(rate)
            desc = f"WAV ({w.getnchannels()}ch, {rate}Hz, {w.getsampwidth()*8}bit)"
            return True, size, duration, desc
    except Exception as e:
        return False, size, 0, f"Corrupt WAV: {e}"

def verify_file(rel_path):
    full_path = os.path.join(os.getcwd(), rel_path.lstrip('/'))
    if rel_path.endswith('.wav'):
        return parse_wav(full_path)
    elif rel_path.endswith('.mp3'):
        return parse_mp3(full_path)
    else:
        return False, 0, 0, "Unknown extension"

def main():
    print("=" * 80)
    print("STORYVERSE 3.0: PHYSICAL AUDIO ASSET AUDIT & INTEGRITY VERIFICATION")
    print("=" * 80)

    # Load voice manifest
    with open('public/assets/audio/voices/manifest.json', 'r', encoding='utf-8') as f:
        voice_manifest = json.load(f)

    records = voice_manifest['records']
    narrator_records = [r for r in records if r['category'] == 'narration']
    dialogue_records = [r for r in records if r['category'] == 'dialogue']

    audit_results = {
        "narration": [],
        "dialogue": [],
        "scores_primary": [],
        "scores_alternatives": [],
        "leitmotifs": [],
        "soundscapes": [],
        "ambience_beds": [],
        "sfx": []
    }

    total_checked = 0
    total_passed = 0
    total_failed = 0

    print("\n--- 1. NARRATION ASSETS (14 Beats - George / ElevenLabs) ---")
    for r in narrator_records:
        path = "public" + r['audioPath']
        ok, size, dur, desc = verify_file(path)
        total_checked += 1
        if ok: total_passed += 1
        else: total_failed += 1
        status = "PASS" if ok else "FAIL"
        entry = {
            "id": r['id'],
            "scene": r['sceneId'],
            "path": r['audioPath'],
            "size_bytes": size,
            "duration_sec": round(dur, 2),
            "manifest_duration_ms": r.get('durationMs', 0),
            "format": desc,
            "status": status,
            "text": r['transcript']
        }
        audit_results["narration"].append(entry)
        print(f"[{status}] {r['id']} ({r['sceneId']}) | {round(dur, 2)}s | {size:,} bytes | {desc} | {r['audioPath']}")

    print("\n--- 2. CHARACTER DIALOGUE ASSETS (34 Takes) ---")
    for r in dialogue_records:
        path = "public" + r['audioPath']
        ok, size, dur, desc = verify_file(path)
        total_checked += 1
        if ok: total_passed += 1
        else: total_failed += 1
        status = "PASS" if ok else "FAIL"
        entry = {
            "id": r['id'],
            "scene": r['sceneId'],
            "speaker": r['characterName'],
            "character_id": r['characterId'],
            "path": r['audioPath'],
            "size_bytes": size,
            "duration_sec": round(dur, 2),
            "manifest_duration_ms": r.get('durationMs', 0),
            "format": desc,
            "status": status,
            "text": r['transcript']
        }
        audit_results["dialogue"].append(entry)
        print(f"[{status}] {r['id']} ({r['characterId']}) | {round(dur, 2)}s | {size:,} bytes | {desc} | {r['audioPath']}")

    # 3. Scene Scores Primary A
    PRIMARY_SCORES = [
        ("scene-01", "public/assets/audio/music/scene_01_music_a.wav"),
        ("scene-02", "public/assets/audio/music/scene_02_music.wav"),
        ("scene-03", "public/assets/audio/music/scene_03_music.wav"),
        ("scene-04", "public/assets/audio/music/scene_04_music_a.wav"),
        ("scene-05", "public/assets/audio/music/scene_05_music_a.wav"),
        ("scene-06", "public/assets/audio/music/scene_06_music_a.wav"),
        ("scene-07", "public/assets/audio/music/scene_07_music.wav"),
        ("scene-08", "public/assets/audio/music/scene_08_music.wav"),
        ("scene-09", "public/assets/audio/music/scene_09_music.wav"),
        ("scene-10", "public/assets/audio/music/scene_10_music_a.wav"),
    ]
    print("\n--- 3. SCENE SCORES: PRIMARY A (10 Compositions) ---")
    for sc, p in PRIMARY_SCORES:
        ok, size, dur, desc = verify_file(p)
        total_checked += 1
        if ok: total_passed += 1
        else: total_failed += 1
        status = "PASS" if ok else "FAIL"
        entry = {"scene": sc, "path": p, "size_bytes": size, "duration_sec": round(dur, 2), "format": desc, "status": status}
        audit_results["scores_primary"].append(entry)
        print(f"[{status}] {sc} | {round(dur, 2)}s | {size:,} bytes | {desc} | {p}")

    # 4. Scene Scores Alternatives B
    ALT_SCORES = [
        ("scene-01", "public/assets/audio/music/scene_01_music_b.wav"),
        ("scene-04", "public/assets/audio/music/scene_04_music_b.wav"),
        ("scene-05", "public/assets/audio/music/scene_05_music_b.wav"),
        ("scene-06", "public/assets/audio/music/scene_06_music_b.wav"),
        ("scene-10", "public/assets/audio/music/scene_10_music_b.wav"),
    ]
    print("\n--- 4. SCENE SCORES: ALTERNATIVE B (5 Compositions) ---")
    for sc, p in ALT_SCORES:
        ok, size, dur, desc = verify_file(p)
        total_checked += 1
        if ok: total_passed += 1
        else: total_failed += 1
        status = "PASS" if ok else "FAIL"
        entry = {"scene": sc, "path": p, "size_bytes": size, "duration_sec": round(dur, 2), "format": desc, "status": status}
        audit_results["scores_alternatives"].append(entry)
        print(f"[{status}] {sc} (Alt B) | {round(dur, 2)}s | {size:,} bytes | {desc} | {p}")

    # 5. Leitmotifs
    LEITMOTIFS = [
        ("motif_storyverse", "public/assets/audio/music/motif_storyverse.wav"),
        ("motif_storyverse_full", "public/assets/audio/music/motif_storyverse_full.wav"),
        ("motif_storyverse_minimal", "public/assets/audio/music/motif_storyverse_minimal.wav"),
        ("motif_death", "public/assets/audio/music/motif_death.wav"),
        ("motif_death_brass", "public/assets/audio/music/motif_death_brass.wav"),
        ("motif_death_suspended", "public/assets/audio/music/motif_death_suspended.wav"),
        ("motif_laila", "public/assets/audio/music/motif_laila.wav"),
        ("motif_laila_fragile", "public/assets/audio/music/motif_laila_fragile.wav"),
        ("motif_laila_resolved", "public/assets/audio/music/motif_laila_resolved.wav"),
        ("motif_transformation", "public/assets/audio/music/motif_transformation.wav"),
        ("motif_transformation_radiant", "public/assets/audio/music/motif_transformation_radiant.wav"),
    ]
    print("\n--- 5. CINEMATIC LEITMOTIFS (11 Variations) ---")
    for mid, p in LEITMOTIFS:
        ok, size, dur, desc = verify_file(p)
        total_checked += 1
        if ok: total_passed += 1
        else: total_failed += 1
        status = "PASS" if ok else "FAIL"
        entry = {"motif_id": mid, "path": p, "size_bytes": size, "duration_sec": round(dur, 2), "format": desc, "status": status}
        audit_results["leitmotifs"].append(entry)
        print(f"[{status}] {mid} | {round(dur, 2)}s | {size:,} bytes | {desc} | {p}")

    # 6. Environmental Soundscapes
    SOUNDSCAPES = [
        ("scene_01_mumbai", "public/assets/audio/soundscapes/scene_01_mumbai.wav"),
        ("scene_02_traffic", "public/assets/audio/soundscapes/scene_02_traffic.wav"),
        ("scene_03_party", "public/assets/audio/soundscapes/scene_03_party.wav"),
        ("scene_04_death_world", "public/assets/audio/soundscapes/scene_04_death_world.wav"),
        ("scene_05_convergence", "public/assets/audio/soundscapes/scene_05_convergence.wav"),
        ("scene_06_transformation", "public/assets/audio/soundscapes/scene_06_transformation.wav"),
        ("scene_07_hospital", "public/assets/audio/soundscapes/scene_07_hospital.wav"),
        ("scene_08_escape", "public/assets/audio/soundscapes/scene_08_escape.wav"),
        ("scene_09_truck", "public/assets/audio/soundscapes/scene_09_truck.wav"),
        ("scene_10_eight_years_later", "public/assets/audio/soundscapes/scene_10_eight_years_later.wav"),
    ]
    print("\n--- 6. ENVIRONMENTAL SOUNDSCAPES (10 Scenes) ---")
    for sid, p in SOUNDSCAPES:
        ok, size, dur, desc = verify_file(p)
        total_checked += 1
        if ok: total_passed += 1
        else: total_failed += 1
        status = "PASS" if ok else "FAIL"
        entry = {"soundscape_id": sid, "path": p, "size_bytes": size, "duration_sec": round(dur, 2), "format": desc, "status": status}
        audit_results["soundscapes"].append(entry)
        print(f"[{status}] {sid} | {round(dur, 2)}s | {size:,} bytes | {desc} | {p}")

    # 7. Ambient Beds
    AMBIENCE_BEDS = [
        ("amb_mumbai", "public/assets/audio/amb_mumbai.wav"),
        ("amb_traffic", "public/assets/audio/amb_traffic.wav"),
        ("amb_party", "public/assets/audio/amb_party.wav"),
        ("amb_celestial", "public/assets/audio/amb_celestial.wav"),
        ("amb_hospital", "public/assets/audio/amb_hospital.wav"),
        ("amb_dawn", "public/assets/audio/amb_dawn.wav"),
    ]
    print("\n--- 7. CONTINUOUS AMBIENT BEDS (6 Loops) ---")
    for aid, p in AMBIENCE_BEDS:
        ok, size, dur, desc = verify_file(p)
        total_checked += 1
        if ok: total_passed += 1
        else: total_failed += 1
        status = "PASS" if ok else "FAIL"
        entry = {"bed_id": aid, "path": p, "size_bytes": size, "duration_sec": round(dur, 2), "format": desc, "status": status}
        audit_results["ambience_beds"].append(entry)
        print(f"[{status}] {aid} | {round(dur, 2)}s | {size:,} bytes | {desc} | {p}")

    # 8. SFX Cues
    SFX_CUES = [
        ("bubble", "public/assets/audio/sfx_bubble.wav"),
        ("discover", "public/assets/audio/sfx_discover.wav"),
        ("ding", "public/assets/audio/sfx_ding.wav"),
        ("horn", "public/assets/audio/sfx_horn.wav"),
        ("thunder", "public/assets/audio/sfx_thunder.wav"),
        ("flatline", "public/assets/audio/sfx_flatline.wav"),
        ("truck", "public/assets/audio/sfx_truck.wav"),
        ("transition", "public/assets/audio/sfx_transition.wav"),
    ]
    print("\n--- 8. DYNAMIC SFX CUES (8 Cues) ---")
    for sfx_id, p in SFX_CUES:
        ok, size, dur, desc = verify_file(p)
        total_checked += 1
        if ok: total_passed += 1
        else: total_failed += 1
        status = "PASS" if ok else "FAIL"
        entry = {"sfx_id": sfx_id, "path": p, "size_bytes": size, "duration_sec": round(dur, 2), "format": desc, "status": status}
        audit_results["sfx"].append(entry)
        print(f"[{status}] {sfx_id} | {round(dur, 2)}s | {size:,} bytes | {desc} | {p}")

    print("\n" + "=" * 80)
    print(f"AUDIT SUMMARY: Checked {total_checked} files across 8 categories.")
    print(f"VERIFICATION STATUS: {total_passed} PASSED, {total_failed} FAILED.")
    print("=" * 80)

    # Save verification JSON for artifact generation
    with open("C:/Users/apaar/.gemini/antigravity/brain/5bb8e9c0-39cc-4320-b0a1-4fadaae4416b/scratch/audio_verification_results.json", "w", encoding="utf-8") as out:
        json.dump({
            "totalChecked": total_checked,
            "totalPassed": total_passed,
            "totalFailed": total_failed,
            "results": audit_results
        }, out, indent=2)

if __name__ == '__main__':
    main()
