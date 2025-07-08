# Preflight MVP Deployment Guide

This guide walks through deploying the Preflight MVP to production on Vercel.

## Prerequisites

- Completed local development setup
- GitHub account
- Vercel account
- OpenAI account with billing enabled
- Upstash Redis account

## Step 1: Set Up External Services

### OpenAI Setup
1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to Settings → Billing
3. Add payment method and set monthly budget to $50
4. Go to API Keys → Create new secret key
5. Copy the key (starts with `sk-`)
6. Save it securely - you'll need it for Vercel

### Upstash Redis Setup
1. Go to [console.upstash.com](https://console.upstash.com)
2. Click "Create Database"
3. Choose:
   - Name: `preflight-ratelimit`
   - Region: Choose closest to your users
   - Type: Regional (not Global)
   - Enable "Eviction" with policy "allkeys-lru"
4. Once created, go to "Details" tab
5. Copy the REST URL and REST Token

## Step 2: Prepare GitHub Repository

1. Push your code to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/preflight-mvp.git
   git branch -M main
   git push -u origin main
   ```

2. Ensure `.env.local` is NOT committed (should be in `.gitignore`)

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Run deployment:
   ```bash
   vercel
   ```

3. Follow prompts:
   - Link to existing project? No
   - What's your project name? preflight-mvp
   - Which directory? ./ (current directory)
   - Override settings? No

### Option B: Using Vercel Dashboard
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - Framework: Next.js
   - Root Directory: ./
   - Build Command: (default)
   - Output Directory: (default)

## Step 4: Configure Environment Variables

In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add the following variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key | Production |
| `UPSTASH_REDIS_REST_URL` | Your Upstash REST URL | Production |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash REST Token | Production |

3. Click "Save" for each variable

## Step 5: Redeploy with Environment Variables

1. Go to Deployments tab
2. Click the three dots on latest deployment
3. Select "Redeploy"
4. Don't change any settings, click "Redeploy"

## Step 6: Verify Deployment

1. Once deployed, click "Visit" to see your live site
2. Test the following:
   - Load the page
   - Try the sample business plan
   - Submit an analysis
   - Check error handling (try very short text)
   - Test feedback buttons

## Step 7: Enable Analytics

1. In Vercel Dashboard → Analytics tab
2. Click "Enable Web Analytics"
3. This is included in Vercel's free tier

## Step 8: Set Up Monitoring

### Cost Monitoring
1. **OpenAI**: 
   - Go to Usage → Set up usage alerts
   - Set alert at $25 and hard limit at $50

2. **Upstash**:
   - Free tier includes 10,000 commands/day
   - Monitor in Upstash console → Usage tab

### Performance Monitoring
1. Vercel Dashboard → Analytics → Web Vitals
2. Monitor:
   - Page load time
   - API response time
   - Error rate

### Custom Domain (Optional)
1. Go to Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions
4. SSL is automatic

## Production Checklist

Before going live:
- [ ] All environment variables are set correctly
- [ ] Test analysis functionality works
- [ ] Verify rate limiting is active (test 11 requests)
- [ ] Check mobile responsive design
- [ ] Confirm analytics is tracking events
- [ ] Set up cost alerts for OpenAI
- [ ] Document API endpoint URL
- [ ] Test error scenarios

## Troubleshooting

### "Missing API Key" Error
- Check environment variables in Vercel dashboard
- Ensure variable names match exactly
- Redeploy after adding variables

### Rate Limiting Not Working
- Verify Upstash credentials are correct
- Check Redis database is active
- Look at Vercel Function logs for errors

### Slow Response Times
- Check Vercel Function logs for timeouts
- Monitor OpenAI API status
- Consider upgrading Vercel plan if needed

### High Costs
- Review OpenAI usage dashboard
- Check for abuse/high traffic
- Implement additional rate limiting if needed

## Maintenance

Weekly tasks:
- Check OpenAI API costs
- Review analytics for usage patterns
- Monitor error logs
- Check user feedback emails

Monthly tasks:
- Review and optimize based on analytics
- Update dependencies for security
- Backup any important data/logs
- Review rate limit settings

## Rollback Process

If issues arise:
1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click three dots → "Promote to Production"
4. Investigate issues in development

## Support

For deployment issues:
- Vercel: [vercel.com/support](https://vercel.com/support)
- OpenAI: [help.openai.com](https://help.openai.com)
- Upstash: [upstash.com/docs](https://upstash.com/docs)