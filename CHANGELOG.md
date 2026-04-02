# WaveTone Changelog

## [Unreleased]

### Added

#### Sub-Host Role System
- **New Role**: Introduced Sub-Host role as backup to Host with hierarchical ranking
- **Database Schema**: Updated Room model to track `hostId` and `subHosts` array with ranking, assignment timestamps, and return timeout settings
- **Server State Management**: Added `roomHosts`, `roomSubHosts`, and `hostTimeoutHandles` maps for runtime host/sub-host tracking
- **Host Assignment**: First participant automatically becomes Host
- **Sub-Host Assignment**: Host can now assign multiple Sub-Hosts with `assign-sub-host` event
- **Sub-Host Revocation**: Host can revoke Sub-Host status with `revoke-sub-host` event
- **Automatic Promotion**: Sub-Host automatically promoted to Host if Host leaves and doesn't return within 5-minute timeout
- **Socket Events**:
  - `assign-sub-host`: Host assigns Sub-Host with optional rank parameter
  - `revoke-sub-host`: Host removes Sub-Host status
  - `sub-host-assigned`: Broadcast when Sub-Host is assigned
  - `sub-host-revoked`: Broadcast when Sub-Host is removed
  - `host-left`: Broadcast when Host leaves (with timeout counter)
  - `host-promoted`: Broadcast when Sub-Host is promoted to Host
  - `sub-host-left`: Broadcast when Sub-Host leaves
  - `room-metadata`: Send Host/Sub-Host info on join

#### Enhanced Profanity Detection
- **Improved Mute Duration**: Increased from 500ms max to 1200ms max with word-count-based calculation
- **Enhanced Logging**: Added comprehensive logging for profanity detection with timestamps, word counts, and mute durations
- **Server Moderation Verification**: Enhanced server-side verification logs showing confidence levels and false positive detection
- **Word-Level Precision**: Improved word timing extraction and mute precision
- **Better Mute Calculation**: Mute duration now scales intelligently based on profanity phrase length

#### Professional Kick Messages
- **Host Kicks**: Now include context: `"You have been removed by the Host ({hostAlias}) for moderation reasons."`
- **Vote-Kick Removals**: Include vote count and threshold: `"You were vote-kicked from this room by participants ({votes}/{required} votes)."`
- **Profanity Auto-Kick**: Include warning count: `"Removed after {MAX_WARNINGS} profanity warnings."`
- **Kick Response Format**: Now includes `code` and `timestamp` fields for better client-side handling
- **Broadcast Messages**: Room receives details about who was kicked and why with `user-kicked` event

#### Server-Side Enhancements
- **Host Verification**: Host operations now verified against `roomHosts` map instead of array position
- **Better Logging**: Detailed logs for host operations, sub-host actions, and role changes
- **Error Handling**: Improved error messages for unauthorized operations
- **Session Continuity**: Host return timeout mechanism ensures sessions don't lose control

### Changed

- **Room Model**: Added `hostId` and `subHosts` array fields
- **Host Kick Logic**: Refactored to use new host tracking system
- **Vote-Kick Messages**: Enhanced with vote statistics in broadcast events
- **Profanity Detection**: Mute timing increased for better coverage
- **Client Logging**: Added detailed profanity detection logs with structured format

### Fixed
- Improved Host identification by using dedicated tracking instead of participant array position
- Better handling of Host departure scenarios
- More accurate mute duration calculation for profanity detection

---

## Version History Summary

### Key Features (Current State)
- Anonymous Voice Rooms with real-time WebRTC communication
- Advanced moderation system (profanity detection, warnings, vote-kick, host-kick)
- IP-based room bans
- AI conversation summaries via Groq SDK
- Speaker balance tracking
- Dark/light theme with persistence
- Room auto-destruction when empty

---

**WaveTone** - *Connect anonymously. Speak freely. Listen respectfully.*