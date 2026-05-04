# Deployment Guide

## Quick Start Deployment

### Option 1: Vercel (Recommended)

**Step 1: Connect GitHub Repository**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository

**Step 2: Configure Environment Variables**
1. In Vercel dashboard, go to Project Settings → Environment Variables
2. Add three variables:
   - `NEXT_PUBLIC_UPSTASH_VECTOR_REST_URL`
   - `UPSTASH_VECTOR_REST_TOKEN`
   - `NEXT_PUBLIC_GROQ_API_KEY`

**Step 3: Deploy**
1. Click "Deploy"
2. Vercel automatically builds and deploys
3. Your app is live! (typically within 1-2 minutes)

### Option 2: CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_UPSTASH_VECTOR_REST_URL
vercel env add UPSTASH_VECTOR_REST_TOKEN
vercel env add NEXT_PUBLIC_GROQ_API_KEY

# Redeploy with variables
vercel --prod
```

### Option 3: Other Platforms

**Netlify:**
```bash
npm run build
# Then deploy the .next folder to Netlify
```

**AWS Amplify:**
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

## Post-Deployment Verification

### 1. Test Live URL
- Visit your Vercel URL
- Test with example queries
- Verify loading states work
- Check mobile responsiveness

### 2. Check Logs
```bash
# View Vercel logs
vercel logs
```

### 3. Monitor Performance
- Vercel Analytics dashboard
- Response time metrics
- Error tracking

## Environment Variables

### Required Variables
```
NEXT_PUBLIC_UPSTASH_VECTOR_REST_URL=https://your-instance.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your_token_here
NEXT_PUBLIC_GROQ_API_KEY=your_key_here
```

### Getting Credentials

**Upstash Vector URL & Token:**
1. Go to [upstash.com](https://upstash.com)
2. Create or select Vector database
3. Copy REST URL and REST Token

**Groq API Key:**
1. Go to [groq.com](https://groq.com)
2. Create account
3. Generate API key
4. Copy the key

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update features"
git push origin main
# Vercel deploys automatically!
```

## Scaling & Performance

### Default Limits
- Concurrent connections: 100+
- Requests/sec: 10+
- Storage: Unlimited

### Optimize Performance
1. Enable caching headers
2. Use Vercel Analytics
3. Monitor response times
4. Optimize images

## Troubleshooting Deployment

### Build Fails
```bash
npm run build --debug
vercel logs --follow
```

### Environment Variables Not Working
1. Verify variable names exactly match code
2. Redeploy after adding variables
3. Check Vercel project settings

### API Connection Fails
1. Verify Upstash URL format
2. Check token hasn't expired
3. Test locally with same variables

## Domain Configuration

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Configure DNS records
4. SSL certificate auto-generated

## Rollback & Version Management

```bash
# View deployments
vercel list

# Rollback to previous
vercel rollback

# Promote staging to production
vercel promote
```

## Cost Estimation

### Monthly Costs
- Vercel: $0-$20 (depends on usage)
- Upstash Vector: $10-20
- Groq API: $5-15 (pay-per-token)
- **Total: ~$15-55/month**

## Monitoring & Alerts

### Set Up Alerts in Vercel
1. Go to Project Settings → Monitoring
2. Enable error tracking
3. Set up email notifications
4. View analytics dashboard

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test live application
3. ✅ Monitor performance
4. ✅ Optimize based on metrics
5. ✅ Add custom domain
6. ✅ Share with portfolio

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Upstash Docs: https://docs.upstash.com
- Groq API: https://console.groq.com/docs
- Next.js Deployment: https://nextjs.org/learn/basics/deploying-nextjs-app
