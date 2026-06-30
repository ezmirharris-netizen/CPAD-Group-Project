<script setup>
import { ref } from 'vue'
import { useAdminStore } from '../../stores/admin'

const adminStore = useAdminStore()

const selectedReport = ref(null)

function openDetails(report) {
  selectedReport.value = report
}
function closeDetails() {
  selectedReport.value = null
}

function formatDate(value) {
  if (!value) return 'N/A'
  const d = new Date(value)
  return isNaN(d) ? value : d.toLocaleString()
}

function formatLabel(value) {
  if (!value) return 'N/A'
  return String(value).charAt(0).toUpperCase() + String(value).slice(1)
}
</script>

<template>

<div class="card">

  <h2>Content Moderation</h2>

  <div
    v-for="report in adminStore.reports"
    :key="report.id"
    class="admin-item"
  >

    <h3>{{ report.title }}</h3>

    <p>
      Reported By:
      {{ report.reportedBy }}
    </p>

    <span
      class="badge"
      :class="
        report.status === 'resolved'
        ? 'badge-success'
        : 'badge-warning'
      "
    >
      {{ report.status }}
    </span>

    <br><br>

    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button
        class="btn-outline"
        style="padding:8px 16px;font-size:.85rem"
        @click="openDetails(report)"
      >
        Details
      </button>

      <button
        v-if="report.status==='pending'"
        @click="adminStore.resolveReport(report.id)"
      >
        Resolve
      </button>
    </div>

  </div>

</div>

<!-- ── REPORT DETAILS MODAL ─────────────────────────────────── -->
<div v-if="selectedReport" class="modal-backdrop" @click.self="closeDetails">
  <div class="modal-window">
    <button class="modal-close" @click="closeDetails">✕</button>

    <h2 style="margin-bottom:4px">{{ selectedReport.title }}</h2>
    <span
      class="badge"
      :class="selectedReport.status === 'resolved' ? 'badge-success' : 'badge-warning'"
      style="margin-bottom:18px;display:inline-block"
    >
      {{ formatLabel(selectedReport.status) }}
    </span>

    <div class="modal-section">
      <h4>Report ID</h4>
      <p>#{{ selectedReport.id }}</p>
    </div>

    <div class="modal-section">
      <h4>Content Type</h4>
      <p>{{ formatLabel(selectedReport.content_type) }} (ID: {{ selectedReport.content_id }})</p>
    </div>

    <div class="modal-section">
      <h4>Reported By</h4>
      <p>{{ selectedReport.reportedBy }}</p>
    </div>

    <div class="modal-section">
      <h4>Reason</h4>
      <p>{{ selectedReport.reason || 'No reason provided.' }}</p>
    </div>

    <div class="modal-section">
      <h4>Date Reported</h4>
      <p>{{ formatDate(selectedReport.created_at) }}</p>
    </div>

    <button class="btn-outline" style="width:100%" @click="closeDetails">Close</button>
  </div>
</div>

</template>

<style scoped>
.modal-section h4 {
  font-size: .8rem; text-transform: uppercase; letter-spacing: .06em;
  color: var(--text-muted); margin-bottom: 4px;
}
</style>