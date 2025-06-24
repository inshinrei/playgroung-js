# How it should be used / structure for casting

```action : ?with OR ?array_of_with```

examples of uses

- **open chat** {{ id }}
- **open thread** {{ parent id }} {{ message topic }}
- **send message** {{ users OR thread }} {{ message }}
- **create/make group** {{ name }} {{ users }}
- **create/make folder** {{ name }} {{ chats }}
- **remove/delete folder** {{ name }} - should show tooltip with folder content on deletion
- **archive** {{ chats }}
- **unarchive** {{ chats }}
- **pin chat** {{ chat }} {{ where }}
- **unpin chat** {{ chat }} {{ from }} - should show tooltip where this chat is pinned


