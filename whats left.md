# v1.0

## guilds

- add user is typing - done but poorly
- add file upload and show progress (will postpone to v2)
- add chat functionality for dms - done
  - fix unread msgs
- automatic read messages
- show message length and maximum in textbox
- show modal if message too long

## friends

- show friends list - done
- allow user to friend others - done
- open dms - done
- block user - done
- unfriend user - done
- accept pending request and cancel sent friend requests - done
- add friends by search - done

- show blocked modal when trying to dm
- hide blocked messages

## User settings

- panic mode functionality (will postpone to v2)
- text and images (will postpone to v2)
- might hide friend requests and privacy and safety (will postpone to v2)

- add upload image for create account - done

# User Profiles

- Add badges
- add support for cropping images - done

# Bugs

**Currently: 4 bugs**

- fix delete msg breaks infinite scroll - fixed
- fix delete and edit msg for dont save chat history - fixed
- fix contents not loading unless clicked when reconnected - fixed??? I think
- isfulfilled not working - fixed
- mentions not working in dms - fixed
- dm not reopening when user sends msg - fixed
- delete button not working on error msg (supposed to delete the unsent message) - fixed
- fix loading priority - done
- retry button on failed for loading guilds and msgs - fixed? it works for some reason now
- no error shown for create account or sign in - fixed
- stuff not reset on log out - fixed
- delete account not working properly - fixed
- loads in basic data even if not logged in - fixed i think
- token not deleted when invalid - fixed
- fix file size max modal - fixed
- fix attachment not being able to be deselected after selected. - fixed
- fix upload attachment not resending on error - fixed
- doesnt scroll fully to bottom (possibly due to attachments loading in late - perhaps defer useeffect until fully loaded) - fixed i think
- scrolling bug from API bot - fixed
- fix unnecessary bans request sent when not admin or owner - fixed
- small box appearing when hovering over message and user has no authority over message - fixed

- fix infinite scroll occuring again after switching back to original guild (HARDEST - it just happens randomly)
- cannot seek video or audio (IMPORTANT)
- websocket keeps disconnecting (IMPORTANT)


# FACTOR CODE

- refactor load order (SUPER IMPORTANT) - fixed
- fix any current bugs before adding new features
- remove console logs or change the format of it
- refactor code to be more readable and compartmentalise it (aka move to own functions if repetitive or long af)

# attachments

- show download option for image and video ( done video)
- support embed audio - done

# etc

- redirect user back if token fails
- limit max total size for attachments to 15mb
- add key binds for cancel on editing message
- remove all debug console.log

# admin

- add rooms functionality
- add users functionality
- add server functionality
- permisssion checking

# maybe

- have option to prevent non friends from dming (hardest probs)
- add emojis
- redesign icons

# games

- wordle
- minesweeper
- 3d multiplayer shooter unity game

# TODO LEFT

- clean up code
- try fix placeholder code
- remove reset my password

# v2.0
