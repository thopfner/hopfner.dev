# v8 QA Grade And Priorities

## Grade

Overall grade: `B+`

### What is strong

- the editor now has a real visual-editing architecture
- inline editing exists across much more of the system
- rich-text editing exists
- build and test health are good
- the implementation is clearly improving in the right direction

### Why it is not an A yet

- large-text editing still breaks the authoring experience in a core way
- dirty-state semantics are still too noisy
- the shell still exposes internal system labels where product labels should exist
- navigation and page-switching are still more developer-tool than premium CMS

## Priority Order

Execute v8 in this order:

1. large-text editing fix
2. false-dirty fix
3. structure-rail and page-navigation polish
4. elite authoring enhancements

Do not reverse this order.

The first two items directly affect trust in the editor.

## Product Bar For v8

After v8:

- editing a large headline or paragraph should feel easy, not cramped
- clicking in and out of text should not create fake unsaved prompts
- the structure rail should read like a page-outline tool, not an internal section-type debugger
- the top bar should help editors move across pages quickly

That is the bar.
