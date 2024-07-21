PUBLISH_DIR := /Volumes/Web
SMB_URL := smb://qnapkin/Web
USER := $(shell whoami)

.PHONY: publish
publish: | ${PUBLISH_DIR}
	cp *.css *.js *.html ${PUBLISH_DIR}

${PUBLISH_DIR}:
	osascript -e 'tell application "Finder" to mount volume "${SMB_URL}"'
