import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.screenTitle}>AI Message Review</Text>

      <Text style={styles.sectionLabel}>Pending</Text>

      {pending.length === 0 ? (
        <Text style={styles.emptyText}>No pending messages</Text>
      ) : (
        pending.map((message) => (
          <View key={message.id} style={styles.card}>
            <Text style={styles.cardTitle}>{message.title}</Text>
            <Text style={styles.cardSummary}>{message.summary}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => handleApprove(message)}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleReject(message)}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {handled.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Handled</Text>
          {handled.map((message) => (
            <View key={message.id} style={styles.handledCard}>
              <Text style={styles.handledTitle}>
                <Text style={styles.checkmark}>✓ </Text>
                {message.title}
              </Text>
              <Text style={styles.handledSummary}>{message.summary}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#a0aec0',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 6,
  },
  cardSummary: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    marginBottom: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#38a169',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#e53e3e',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  handledCard: {
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  handledTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 4,
  },
  checkmark: {
    color: '#38a169',
    fontWeight: '700',
  },
  handledSummary: {
    fontSize: 13,
    color: '#718096',
    lineHeight: 18,
  },
});
