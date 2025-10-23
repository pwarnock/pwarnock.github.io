+++
date = 2025-10-09
draft = false
title = 'YouSong'
description = 'AI-powered childrens scripture music generator built during hackathon, featuring full-stack development with modern AI tools and rapid deployment.'
client = 'Hackathon Project - FaithTech OC/SoCal Chapter'
technologies = ['Next.js', 'Supabase', 'Vercel', 'ElevenLabs Music API', 'OpenAI', 'SendGrid', 'Tailwind CSS']
live_url = 'https://frontend-one-tau-55.vercel.app/'
github_url = 'https://github.com/pwarnock/sunday-school-music-creator'
# featured_image = '/img/portfolio/yousong-screenshot.webp'
completion_date = '2025-10'
category = 'Hackathon Project'
+++

# YouSong - AI Scripture Music Generator

YouSong is an AI-powered application that generates children's scripture-based songs, built during the Gloo AI Hackathon 2025. The project demonstrates rapid full-stack development using cutting-edge AI tools and modern web technologies to create an engaging educational music experience.

## Project Overview

Developed as part of the FaithTech OC/SoCal Chapter team for the Gloo AI Hackathon, YouSong enables users to create custom children's songs with scripture-based lyrics through AI assistance. The application combines modern AI capabilities with user-friendly interfaces to make religious education engaging and creative.

## Core Features

### AI-Powered Music Generation
- **Interactive Chat Interface**: Users interact with an AI agent persona acting as a Sunday school teacher
- **Scripture-Based Lyrics**: AI generates age-appropriate lyrics based on scripture content
- **Music Creation**: Lyrics are transformed into prompts for ElevenLabs Music API to generate original songs
- **User Collections**: Generated songs are saved to personal collections in Supabase

### User Authentication & Management
- **Dual Authentication**: Email/password with SendGrid verification or Google OAuth integration
- **Personal Song Libraries**: Each user maintains their own collection of generated songs
- **Usage Limits**: Standard users limited to 3 songs (expandable via dev tools)
- **Secure Storage**: All user data and songs stored securely in Supabase

### Modern UI/UX
- **Responsive Design**: Built with Next.js and Tailwind CSS for optimal cross-device experience
- **Custom Theme**: Team-provided custom theme with color pack integration
- **Intuitive Interface**: Simple, child-friendly design for easy navigation
- **Real-time Feedback**: Immediate response from AI agent during song creation process

## Technical Implementation

### Full-Stack Architecture
**Frontend Development**
- Next.js application with server-side rendering capabilities
- Tailwind CSS for responsive, modern styling
- Custom color theming system provided by team
- Component-based architecture for maintainability

**Backend & Database**
- Supabase for complete backend-as-a-service solution
- PostgreSQL database for user data and song storage
- Real-time subscriptions for live updates
- Row-level security for data isolation

**AI Integration**
- OpenAI API for lyric generation with Sunday school teacher persona
- ElevenLabs Music API for original music composition
- Custom prompt engineering for optimal music generation
- Error handling and retry logic for AI service reliability

### Development Workflow
**AI-Assisted Development**
- Built entirely using opencode AI assistant
- Rapid prototyping with Gloo AI tools
- Minimal development time from concept to deployment
- Collaborative development with team members

**Deployment & Infrastructure**
- Vercel for seamless frontend deployment
- Supabase for managed backend services
- Environment-specific configuration management
- Zero-downtime deployment pipeline

## Hackathon Experience

### Team Collaboration
- **Parallel Development**: Collaborated with another developer building on Lovable platform
- **Design Integration**: Incorporated team-provided custom theme and landing page design
- **Full-Stack Responsibility**: Handled complete application architecture and implementation
- **Rapid Iteration**: Quick development cycles based on team feedback and requirements

### Technical Achievements
- **Complete Working App**: Delivered fully functional application within hackathon timeframe
- **AI Agent Creation**: Successfully implemented interactive AI persona for user guidance
- **Multi-Service Integration**: Seamlessly connected multiple AI services and APIs
- **Cost-Effective Development**: Utilized modern tools to minimize development and infrastructure costs

## Technology Stack

**Frontend**: Next.js, Tailwind CSS, React Hooks
**Backend**: Supabase (PostgreSQL, Auth, Storage)
**AI Services**: OpenAI API, ElevenLabs Music API
**Deployment**: Vercel, Supabase Hosting
**Authentication**: Supabase Auth, Google OAuth, SendGrid Email
**Development**: opencode AI, Gloo AI Tools

## Project Impact

### Technical Innovation
- Demonstrated cutting-edge AI integration in educational technology
- Showcased rapid development capabilities using modern AI tools
- Successfully deployed complex full-stack application in minimal time
- Created engaging, child-friendly educational experience

### Hackathon Success
- Complete functional prototype delivered within competition timeframe
- Positive team collaboration and integration experience
- Demonstrated ability to work with multiple AI services simultaneously
- Created innovative solution for religious education challenges

## Future Considerations

While built for a hackathon, YouSong demonstrates:
- Expertise in modern AI service integration
- Full-stack development capabilities with Next.js and Supabase
- Rapid prototyping and deployment skills
- Understanding of educational technology needs
- Ability to create engaging, child-friendly applications

The project showcases the power of combining modern AI tools with rapid development workflows to create meaningful educational experiences in record time.