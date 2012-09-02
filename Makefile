src=bootstrap.js chrome.manifest content/alert.js content/alert.xul install.rdf Makefile
xpi: $(src)
	zip notifier.xpi -r $(src)
