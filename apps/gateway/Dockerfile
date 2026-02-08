FROM oven/bun:1.1.38

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose port (Render will set PORT env var)
EXPOSE 3000

# Start the app
CMD ["bun", "run", "start"]