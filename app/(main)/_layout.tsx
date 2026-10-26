import React from 'react';
import { Stack } from 'expo-router';

/**
 * Root stack for the authenticated area.
 *
 * The drawer (with all the top-level sections) is a single screen in this
 * stack. Detail routes (book, user, discussion, network) are siblings of the
 * drawer and get pushed ON TOP of it. This way:
 *  - Opening a detail pushes over whatever drawer section you were on.
 *  - Going back pops exactly to the previous screen (the drawer section),
 *    never to a stale detail from an earlier visit.
 */
export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(drawer)" />
      <Stack.Screen name="book" />
      <Stack.Screen name="user" />
      <Stack.Screen name="discussion" />
      <Stack.Screen name="network" />
    </Stack>
  );
}
