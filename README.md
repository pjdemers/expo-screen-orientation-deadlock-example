# Example of Deadlock in expo-screen-orientation on iOS

## Run this Sample

Run in Expo Go or build and run.

Switch to the "Table" tab. Rotate clockwise 1 time. If expo-screen-orientation worked correctly, the text would change from "Portait" to "Landscape"

## Bug Details

PR [https://github.com/expo/expo/pull/33572](https://github.com/expo/expo/pull/33572) introduced a deadlock. Under some code paths, an async task with a barrier waits for a synced task on the same queue. 

The deadlocking queue definition, in class ScreenOrientationRegistry: [https://github.com/expo/expo/blob/b3aeeeac3fc5d19bd716b6fe94d16984383c2c09/packages/expo-screen-orientation/ios/ScreenOrientationRegistry.swift#L20}}](https://github.com/expo/expo/blob/b3aeeeac3fc5d19bd716b6fe94d16984383c2c09/packages/expo-screen-orientation/ios/ScreenOrientationRegistry.swift#L20)

The problem starts in when the method screenOrientationDidChange in the same class ScreenOrientationRegistry, puts a task on the queue with a barrier, [https://github.com/expo/expo/blob/b3aeeeac3fc5d19bd716b6fe94d16984383c2c09/packages/expo-screen-orientation/ios/ScreenOrientationRegistry.swift#L207](https://github.com/expo/expo/blob/b3aeeeac3fc5d19bd716b6fe94d16984383c2c09/packages/expo-screen-orientation/ios/ScreenOrientationRegistry.swift#L207)

A few lines later, there is a call to screenOrientationDidChange [https://github.com/expo/expo/blob/b3aeeeac3fc5d19bd716b6fe94d16984383c2c09/packages/expo-screen-orientation/ios/ScreenOrientationRegistry.swift#L211](https://github.com/expo/expo/blob/b3aeeeac3fc5d19bd716b6fe94d16984383c2c09/packages/expo-screen-orientation/ios/ScreenOrientationRegistry.swift#L211)

screenOrientationDidChange calls ModuleOrientationLock.from [https://github.com/expo/expo/blob/b3aeeeac3fc5d19bd716b6fe94d16984383c2c09/packages/expo-screen-orientation/ios/ScreenOrientationModule.swift#L103](https://github.com/expo/expo/blob/b3aeeeac3fc5d19bd716b6fe94d16984383c2c09/packages/expo-screen-orientation/ios/ScreenOrientationModule.swift#L103)

Depending on how the orientation lock is set, ModuleOrientationLock.from calls methods that may eventually call method requiredOrientationMask back in class ScreenOrientationRegistry, [https://github.com/expo/expo/blob/b3aeeeac3fc5d19bd716b6fe94d16984383c2c09/packages/expo-screen-orientation/ios/ScreenOrientationRegistry.swift#L127](https://github.com/expo/expo/blob/b3aeeeac3fc5d19bd716b6fe94d16984383c2c09/packages/expo-screen-orientation/ios/ScreenOrientationRegistry.swift#L127)

This method puts a synchronous task on the same queue ScreenOrientationRegistry. That task will never run, because screenOrientationDidChange is holding the queue with a barrier.

## Solution

Change method screenOrientationDidChange in class ScreenOrientationRegistry to queue two tasks, the first is synchronous:

  func screenOrientationDidChange(_ newScreenOrientation: UIInterfaceOrientation) {
    queue.sync(flags: .barrier) {
      // Write with the barrier:
      if (self.currentScreenOrientation != newScreenOrientation) {
        // Only change if necessary, to prevent listeners from re-calling this method.
        self.currentScreenOrientation = newScreenOrientation
      }
    }
    queue.async() {
      // Read without the barrier:
      for controller in self.orientationControllers {
        controller.screenOrientationDidChange(newScreenOrientation)
      }
    }
  }

To see the fix work in this example, copy [ScreenOrientationRegistry.swift.fixed](ScreenOrientationRegistry.swift.fixed) to [./node_modules/expo-screen-orientation/ios/ScreenOrientationRegistry.swift](node_modules/expo-screen-orientation/ios/ScreenOrientationRegistry.swift) and re-run.

## My PR title:

[ios][screen-orientation] Fixed deadlock caused by PR 33572


