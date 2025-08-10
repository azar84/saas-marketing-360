# BuiltWith API Setup for Tech Discovery

## Overview
The Tech Discovery feature uses the BuiltWith API to search for companies using specific technologies and enrich company data with detailed tech stack information.

## Current Status
- ✅ **Development Mode**: Currently using mock data for testing
- ⚠️ **Production Ready**: Requires real BuiltWith API key

## Getting a BuiltWith API Key

### 1. Sign Up for BuiltWith API
1. Visit [BuiltWith API](https://builtwith.com/api)
2. Create an account or sign in
3. Navigate to the API section
4. Choose a plan that fits your needs:
   - **Free Tier**: Limited requests per month
   - **Paid Plans**: Higher limits and additional features

### 2. API Key Features
- **Lists API**: Search for companies using specific technologies
- **Domain API**: Get detailed tech stack for individual domains
- **Rate Limits**: Varies by plan (check your plan details)

### 3. Configure Your Environment

#### Update `.env` file:
```bash
# Replace the test key with your real API key
BUILTWITH_API_KEY="your-real-api-key-here"
```

#### Environment Variables:
```bash
# Required for Tech Discovery
BUILTWITH_API_KEY="your-api-key"

# Optional: Debug mode for API calls
DEBUG=true
```

## API Endpoints Used

### 1. Lists API (`/lists11/api.json`)
**Purpose**: Search for companies using specific technologies

**Parameters**:
- `KEY`: Your API key
- `TECH`: Technology to search for (e.g., "WooCommerce")
- `META`: "yes" to include contact information
- `COUNTRY`: Optional country filter
- `SINCE`: Optional date filter (e.g., "30 Days Ago")

**Example Request**:
```
https://api.builtwith.com/lists11/api.json?KEY=your-key&TECH=WooCommerce&META=yes
```

### 2. Domain API (`/v21/api.json`)
**Purpose**: Get detailed tech stack for a specific domain

**Parameters**:
- `KEY`: Your API key
- `LOOKUP`: Domain to analyze (e.g., "example.com")

**Example Request**:
```
https://api.builtwith.com/v21/api.json?KEY=your-key&LOOKUP=example.com
```

## Testing Your API Key

### 1. Test Lists API
```bash
curl "https://api.builtwith.com/lists11/api.json?KEY=your-key&TECH=WooCommerce&META=yes"
```

### 2. Test Domain API
```bash
curl "https://api.builtwith.com/v21/api.json?KEY=your-key&LOOKUP=example.com"
```

## Rate Limiting

### BuiltWith API Limits
- **Free Tier**: Usually 100-1000 requests per month
- **Paid Plans**: Higher limits based on plan
- **Rate Limiting**: Requests are throttled to prevent abuse

### Our Implementation
- **Delay Between Calls**: 1 second between API calls
- **Batch Processing**: Enrichment is done in batches
- **Error Handling**: Graceful handling of rate limit errors

## Error Handling

### Common Errors
1. **Invalid API Key**: Check your API key in `.env`
2. **Rate Limit Exceeded**: Wait and try again later
3. **Invalid Technology**: Technology not found in BuiltWith database
4. **Network Issues**: Check your internet connection

### Debug Mode
Enable debug mode to see detailed API logs:
```bash
DEBUG=true npm run dev
```

## Development vs Production

### Development (Current)
- Uses mock data for testing
- No API key required
- Full functionality for UI testing

### Production
- Requires real BuiltWith API key
- Real company data
- Rate limiting applies

## Troubleshooting

### 1. "Failed to search companies"
- Check if API key is set correctly
- Verify API key is valid
- Check network connectivity

### 2. "Invalid technology selected"
- Technology must be in our `technologies.json` list
- Check spelling and case sensitivity

### 3. "Rate limit exceeded"
- Wait before making more requests
- Consider upgrading your BuiltWith plan

## Security Notes

### API Key Security
- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly
- Monitor API usage

### Data Privacy
- BuiltWith data is publicly available
- No personal information is stored
- Respect rate limits and terms of service

## Next Steps

1. **Get a BuiltWith API Key**: Sign up at builtwith.com/api
2. **Update Environment**: Replace test key with real key
3. **Test API Calls**: Verify your key works
4. **Monitor Usage**: Keep track of API calls
5. **Scale as Needed**: Upgrade plan if you need more requests

## Support

- **BuiltWith API Docs**: https://builtwith.com/api
- **BuiltWith Support**: Contact their support team
- **Our Implementation**: Check the code in `src/lib/builtwith.ts`
