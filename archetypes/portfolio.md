---
title: '{{ .Name | humanize | title }}'
date: {{ .Date }}
draft: false
description: 'Brief project description for portfolio cards and SEO'
client: 'Personal Project - Category'
technologies: ['Technology1', 'Technology2']
github_url: 'https://github.com/username/repo-name'
live_url: 'https://example.com/live-demo'
completion_date: '{{ dateFormat "2006-01" .Date }}'
category: 'Web App'
---

# {{ .Name | humanize | title }}

Project description and details go here.

## Overview

Brief overview of the project.

## Technologies Used

- Technology1
- Technology2

## Links

- [Live Demo]({{ .Params.live_url }})
- [GitHub Repository]({{ .Params.github_url }})

## Screenshots

Add screenshots or images here.
