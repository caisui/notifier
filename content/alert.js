const Cu = Components.utils;
const Ci = Components.interfaces;

gNewMessages = [];
gTimer = 0;

function addMessage(item) {
    var wr;
    if (item instanceof Ci.nsIWeakReference) {
        wr = item;
        //item = item.get();
    } else {
        //wr = Cu.getWeakReference(item);
        wr = item;
    }
    if (item && item.isRead) return;
    gNewMessages.push(wr);

    if (gTimer) window.clearTimeout(gTimer);
    gTimer = window.setTimeout(updateWindow, 100);
}

function createIconMenuItem(label) {
    var item = document.createElement("menuitem");
    item.setAttribute("label", label);
    item.classList.add("menuitem-iconic");
    return item;
}

function createRootBox(root) {
    var box = document.createElement("vbox");
    var list = box.classList;
    list.add(root.server.type);

    var item = createIconMenuItem(root.name);
    item.classList.add("root");
    box.appendChild(item);
    return box;
}

function createFolderBox(folder) {
    var box = document.createElement("vbox");

    var item = createIconMenuItem(folder.name);
    item.classList.add("folder");
    box.appendChild(item);
    return box;
}

function createMessageBox(msg) {
    var item = createIconMenuItem(msg.mime2DecodedSubject);
    item.classList.add("item");
    return item;
}

function updateWindow() {
    gTimer = 0;
    var list = gNewMessages;
    var newList = [];
    var msg, mbox;

    var body = document.getElementById("list");
    var frag = document.createDocumentFragment();
    list = list.filter(function (a) {
        //a = a.get();
        return a && !a.isRead;
    });
    list.sort(function (a, b) {
        //a = a.get();
        //b = b.get();
        return a.folder.URI.localeCompare(b.folder.URI) || a.date - b.date;
    });
    gNewMessages = list;
    var root, folder, newRoot, newFolder;
    for (var i = 0, j = list.length; i < j; i++) {
        //msg = list[i].get();
        msg = list[i];
        if (!msg || msg.isRead) continue;
        if (folder !== (folder = msg.folder)) {
            if (root !== (root = folder.rootFolder)) {
                newRoot = createRootBox(root);
                frag.appendChild(newRoot);
            }
            newFolder = createFolderBox(folder);
            newRoot.appendChild(newFolder);
        }
        newFolder.appendChild(createMessageBox(msg));
    }
    var r = document.createRange();
    r.selectNodeContents(body);
    r.extractContents()
    r.detach();
    body.appendChild(frag);

    var screen = window.screen;
    window.sizeToContent();
    window.screenX = screen.availWidth - window.innerWidth;
    window.screenY = screen.availHeight - window.innerHeight;
}
