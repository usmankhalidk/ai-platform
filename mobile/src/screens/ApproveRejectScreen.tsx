import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { Message } from '../types';

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    title: 'Contract Review Request',
    summary:
      'AI suggests approving the vendor contract — terms are standard with a 30-day net payment clause and no unusual liability provisions.',
  },
  {
    id: '2',
    title: 'Expense Report #4821',
    summary:
      'AI flagged one item: a $340 team dinner. All other expenses are within policy limits and properly receipted.',
  },
  {
    id: '3',
    title: 'Data Pipeline Alert',
    summary:
      'AI detected a 12% drop in throughput on the ETL pipeline at 03:00 UTC. Root cause appears to be a memory limit on the transform worker.',
  },
  {
    id: '4',
    title: 'Customer Refund Request',
    summary:
      'AI recommends approving the $89 refund for order #9912. Customer history is excellent and the product defect claim is consistent with known batch issues.',
  },
];

// Design tokens — dark theme matching the web dashboard
const C = {
  bg: '#09090B',           // zinc-950
  surface: '#18181B',      // zinc-900
  surfaceHover: '#27272A', // zinc-800
  border: 'rgba(255,255,255,0.08)',
  borderAccent: 'rgba(34,211,238,0.3)',
  accent: '#22D3EE',       // cyan-400
  success: '#34D399',      // emerald-400
  danger: '#F87171',       // red-400
  text: '#FAFAFA',         // zinc-50
  textSub: '#A1A1AA',      // zinc-400
  textMuted: '#52525B',    // zinc-600
  handled: '#141417',
};

export default function ApproveRejectScreen(): React.JSX.Element {
  const [pending, setPending] = useState<Message[]>(INITIAL_MESSAGES);
  const [handled, setHandled] = useState<Message[]>([]);

  const handleApprove = (message: Message): void => {
    setPending((prev) => prev.filter((m) => m.id !== message.id));
    setHandled((prev) => [...prev, message]);
  };

  const handleReject = (message: Message): void => {
    setPending((prev) => prev.filter((m) => m.id !== message.id));
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        {/* Wordmark */}
        <View style={styles.wordmark}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>AI</Text>
          </View>
          <Text style={styles.appName}>Platform</Text>
        </View>

        {/* Pending badge */}
        {pending.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pending.length}</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <Text style={styles.pageTitle}>Message Review</Text>
        <Text style={styles.pageSubtitle}>AI-generated summaries awaiting your decision</Text>

        {/* ── Pending section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>PENDING</Text>
          <View style={styles.sectionLine} />
        </View>

        {pending.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptyText}>No pending messages</Text>
          </View>
        ) : (
          pending.map((message, index) => (
            <View
              key={message.id}
              style={[styles.card, index === 0 && styles.cardFirst]}
            >
              {/* Top accent line on first card */}
              {index === 0 && <View style={styles.cardAccentLine} />}

              {/* Card content */}
              <Text style={styles.cardTitle}>{message.title}</Text>
              <Text style={styles.cardSummary}>{message.summary}</Text>

              {/* Action buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.approveBtn}
                  onPress={() => handleApprove(message)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.approveBtnText}>✓  Approve</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => handleReject(message)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.rejectBtnText}>✕  Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* ── Handled section ── */}
        {handled.length > 0 && (
          <>
            <View style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
              <Text style={styles.sectionLabel}>HANDLED</Text>
              <View style={styles.sectionLine} />
            </View>

            {handled.map((message) => (
              <View key={message.id} style={styles.handledCard}>
                <View style={styles.handledRow}>
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                  <Text style={styles.handledTitle}>{message.title}</Text>
                </View>
                <Text style={styles.handledSummary}>{message.summary}</Text>
              </View>
            ))}
          </>
        )}

        {/* Bottom padding for scroll */}
        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ── Header ──────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(34,211,238,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: C.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  appName: {
    color: C.textSub,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  badge: {
    backgroundColor: C.accent,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#09090B',
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Scroll ──────────────────────────────────────
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },

  // ── Page title ──────────────────────────────────
  pageTitle: {
    color: C.text,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  pageSubtitle: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 28,
    lineHeight: 18,
  },

  // ── Section header ──────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionHeaderSpaced: {
    marginTop: 32,
  },
  sectionLabel: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },

  // ── Pending cards ────────────────────────────────
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardFirst: {
    borderColor: 'rgba(34,211,238,0.2)',
  },
  cardAccentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(34,211,238,0.5)',
  },
  cardTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  cardSummary: {
    color: C.textSub,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
    fontWeight: '400',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: 'rgba(52,211,153,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  approveBtnText: {
    color: C.success,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: 'rgba(248,113,113,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.25)',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: C.danger,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── Empty state ─────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 8,
  },
  emptyIcon: {
    fontSize: 32,
    color: C.success,
    marginBottom: 12,
  },
  emptyTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyText: {
    color: C.textMuted,
    fontSize: 13,
  },

  // ── Handled cards ────────────────────────────────
  handledCard: {
    backgroundColor: C.handled,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 8,
  },
  handledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: C.success,
    fontSize: 11,
    fontWeight: '700',
  },
  handledTitle: {
    color: C.textSub,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  handledSummary: {
    color: C.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400',
  },
});
