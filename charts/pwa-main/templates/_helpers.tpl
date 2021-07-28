{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "pwa-main.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "pwa-main.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "pwa-main.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
    ingress configuration
*/}}
{{- define "pwa-ingress.service" -}}
{{- if .Values.nginx.enabled -}}
{{- printf "%s" (include  "pwa-nginx.fullname" . ) -}}
{{- else -}}
{{- printf "%s" (include  "pwa-main.fullname" . ) -}}
{{- end -}}
{{- end -}}

{{/*
pwa nginx variables
*/}}
{{- define "pwa-nginx.fullname" -}}
{{- printf "%s-%s" (include  "pwa-main.fullname" . ) "nginx" -}}
{{- end -}}

{{- define "pwa-nginx.name" -}}
{{- printf "%s-%s" (include  "pwa-main.name" . ) "nginx" -}}
{{- end -}}

{{/*
pwa channels configuration
- required for the pwa nginx
*/}}
{{- define "pwa-channels.fullname" -}}
{{- printf "%s-%s" (include  "pwa-main.fullname" . ) "channels" -}}
{{- end -}}

{{- define "pwa-channels.name" -}}
{{- printf "%s-%s" (include  "pwa-main.name" . ) "channels" -}}
{{- end -}}
