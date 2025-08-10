# Google Custom Search API Setup Guide

This guide will help you set up Google Custom Search API for use with the Search Engine Manager in your admin panel.

## Prerequisites

- Google account
- Google Cloud Console access
- Basic understanding of APIs

## Step 1: Enable Custom Search API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Library**
4. Search for "Custom Search API"
5. Click on "Custom Search API" and click **Enable**

## Step 2: Create API Credentials

1. In the same project, go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the generated API key (you'll need this later)
4. **Important**: Restrict the API key to only Custom Search API for security

## Step 3: Create Custom Search Engine

1. Go to [Google Custom Search](https://cse.google.com/)
2. Click **Add** to create a new search engine
3. Enter your website URL or leave blank for web-wide search
4. Give your search engine a name
5. Click **Create**
6. Copy the **Search Engine ID** (cx parameter) - it looks like: `123456789:abcdefghijk`

## Step 4: Configure Environment Variables

Add these environment variables to your `.env.local` file:

```bash
NEXT_PUBLIC_GOOGLE_CUSTOM_SEARCH_API_KEY=your_api_key_here
NEXT_PUBLIC_GOOGLE_CSE_ID=your_search_engine_id_here
```

## Step 5: Test the Setup

1. Start your development server
2. Go to Admin Panel > Search Engine
3. Enter your API credentials in the configuration panel
4. Try a test search query

## Usage Limits

- **Free Tier**: 100 searches per day
- **Paid Tier**: $5 per 1000 searches
- **Rate Limit**: 10,000 searches per day

## Security Best Practices

1. **Restrict API Key**: Limit your API key to only Custom Search API
2. **Monitor Usage**: Check your Google Cloud Console for usage statistics
3. **Environment Variables**: Never commit API keys to version control
4. **Rate Limiting**: Implement rate limiting in production if needed

## Troubleshooting

### Common Issues

1. **"API key is invalid"**
   - Check if the API key is correct
   - Ensure Custom Search API is enabled
   - Verify the API key has proper permissions

2. **"Invalid search engine ID"**
   - Check if the search engine ID (cx) is correct
   - Ensure the search engine is properly configured

3. **"Quota exceeded"**
   - Check your daily quota in Google Cloud Console
   - Consider upgrading to paid tier if needed

### Error Codes

- **403**: API key invalid or quota exceeded
- **400**: Invalid parameters or search engine ID
- **429**: Rate limit exceeded

## Support

For additional help:
- [Google Custom Search API Documentation](https://developers.google.com/custom-search/v1/overview)
- [Google Cloud Console Help](https://cloud.google.com/docs)
- [Custom Search Engine Help](https://support.google.com/cse/)

## Next Steps

Once configured, you can:
- Perform web searches from your admin panel
- Analyze search results for SEO insights
- Research competitors and industry trends
- Gather data for content marketing strategies
