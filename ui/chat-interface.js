class BargainerChatUI {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.clearButton = document.getElementById('clear-chat');
        this.charCount = document.getElementById('char-count');
        this.connectionStatus = document.getElementById('connection-status');
        
        this.isTyping = false;
        this.socket = null;
        
        this.initializeSocket();
        this.initializeEventListeners();
        this.focusInput();
    }
    
    initializeSocket() {
        // Try to connect to Socket.IO server, fallback to mock if not available
        try {
            this.socket = io();
            
            this.socket.on('connect', () => {
                console.log('Connected to server');
                this.updateConnectionStatus(true);
            });
            
            this.socket.on('disconnect', () => {
                console.log('Disconnected from server');
                this.updateConnectionStatus(false);
            });
            
            this.socket.on('chat_response', (data) => {
                this.hideTypingIndicator();
                if (data.success) {
                    const response = this.formatMCPResponse(data.data, data.intent);
                    this.addMessage(response, 'assistant');
                } else {
                    this.addMessage('Sorry, I encountered an error while processing your request. Please try again.', 'assistant', 'error');
                }
            });
        } catch (error) {
            console.log('Socket.IO not available, using mock client');
            this.socket = null;
            this.mcpClient = new MockMCPClient();
        }
    }
    
    updateConnectionStatus(connected) {
        const statusDiv = this.connectionStatus;
        const dot = statusDiv.querySelector('div');
        const text = statusDiv.querySelector('span');
        
        if (connected) {
            dot.className = 'w-3 h-3 bg-green-400 rounded-full animate-pulse';
            text.textContent = 'Connected';
        } else {
            dot.className = 'w-3 h-3 bg-red-400 rounded-full';
            text.textContent = 'Disconnected';
        }
    }
    
    initializeEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Character count
        this.userInput.addEventListener('input', () => {
            const length = this.userInput.value.length;
            this.charCount.textContent = `${length}/500`;
            
            if (length > 450) {
                this.charCount.classList.add('text-red-500');
            } else {
                this.charCount.classList.remove('text-red-500');
            }
        });
        
        // Clear chat
        this.clearButton.addEventListener('click', () => this.clearChat());
        
        // Quick actions
        document.querySelectorAll('.quick-action').forEach(button => {
            button.addEventListener('click', (e) => {
                const query = e.target.getAttribute('data-query') || e.target.closest('.quick-action').getAttribute('data-query');
                this.userInput.value = query;
                this.sendMessage();
            });
        });
    }
    
    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message || this.isTyping) return;
        
        // Add user message
        this.addMessage(message, 'user');
        this.userInput.value = '';
        this.charCount.textContent = '0/500';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Process message and get response
            if (this.socket && this.socket.connected) {
                // Socket.IO will handle the response via event listener
                const response = await this.processMessage(message);
            } else {
                // Use mock client
                const response = await this.processMessage(message);
                this.hideTypingIndicator();
                this.addMessage(response, 'assistant');
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error while processing your request. Please try again.', 'assistant', 'error');
        }
        
        this.focusInput();
    }
    
    async processMessage(message) {
        // Parse user intent and call appropriate MCP tools
        const intent = this.parseIntent(message);
        
        if (this.socket && this.socket.connected) {
            // Use real Socket.IO connection
            this.socket.emit('chat_message', { message, intent });
        } else {
            // Fall back to mock client
            switch (intent.type) {
                case 'search_deals':
                    return await this.handleSearchDeals(intent);
                case 'top_deals':
                    return await this.handleTopDeals(intent);
                case 'compare_deals':
                    return await this.handleCompareDeals(intent);
                case 'help':
                    return this.getHelpMessage();
                default:
                    return await this.handleGeneralQuery(message);
            }
        }
    }
    
    formatMCPResponse(data, intent) {
        switch (intent.type) {
            case 'search_deals':
                return this.formatDealsResponse(data, `Found ${data.results} deals matching your search:`);
            case 'top_deals':
                return this.formatDealsResponse(data, 'Here are the top trending deals:');
            case 'compare_deals':
                return this.formatComparisonResponse(data);
            default:
                return this.formatDealsResponse(data, 'Here are some deals I found:');
        }
    }
    
    parseIntent(message) {
        const lower = message.toLowerCase();
        
        // Extract price range
        const priceMatch = lower.match(/under \$?(\d+)|below \$?(\d+)|less than \$?(\d+)/);
        const maxPrice = priceMatch ? parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3]) : null;
        
        const minPriceMatch = lower.match(/over \$?(\d+)|above \$?(\d+)|more than \$?(\d+)/);
        const minPrice = minPriceMatch ? parseInt(minPriceMatch[1] || minPriceMatch[2] || minPriceMatch[3]) : null;
        
        // Extract category
        let category = null;
        const categories = {
            'electronics': ['electronics', 'electronic', 'tech', 'gadget'],
            'computers': ['laptop', 'computer', 'pc', 'gaming', 'monitor'],
            'home-garden': ['home', 'kitchen', 'appliance', 'furniture'],
            'clothing': ['clothes', 'clothing', 'shirt', 'pants', 'shoes'],
            'automotive': ['car', 'auto', 'vehicle', 'tire'],
            'sports-outdoors': ['sports', 'outdoor', 'fitness', 'bike']
        };
        
        for (const [cat, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lower.includes(keyword))) {
                category = cat;
                break;
            }
        }
        
        // Determine intent type
        if (lower.includes('top') || lower.includes('trending') || lower.includes('hot') || lower.includes('best deals')) {
            return { type: 'top_deals', category, maxPrice, minPrice };
        } else if (lower.includes('compare') || lower.includes('comparison')) {
            return { type: 'compare_deals', query: message, category, maxPrice, minPrice };
        } else if (lower.includes('help') || lower.includes('what can you do')) {
            return { type: 'help' };
        } else {
            return { type: 'search_deals', query: message, category, maxPrice, minPrice };
        }
    }
    
    async handleSearchDeals(intent) {
        const params = {
            query: intent.query,
            ...(intent.category && { category: intent.category }),
            ...(intent.maxPrice && { maxPrice: intent.maxPrice }),
            ...(intent.minPrice && { minPrice: intent.minPrice }),
            limit: 5
        };
        
        const response = await this.mcpClient.callTool('search_deals', params);
        return this.formatDealsResponse(response, `Found ${response.results} deals matching your search:`);
    }
    
    async handleTopDeals(intent) {
        const params = {
            limit: 5,
            ...(intent.category && { category: intent.category })
        };
        
        const response = await this.mcpClient.callTool('get_top_deals', params);
        return this.formatDealsResponse(response, 'Here are the top trending deals:');
    }
    
    async handleCompareDeals(intent) {
        // First search for deals, then compare
        const searchResponse = await this.mcpClient.callTool('search_deals', {
            query: intent.query,
            limit: 10
        });
        
        const compareResponse = await this.mcpClient.callTool('compare_deals', {
            deals: searchResponse.deals
        });
        
        return this.formatComparisonResponse(compareResponse);
    }
    
    async handleGeneralQuery(message) {
        // Try to extract search terms and search for deals
        const response = await this.mcpClient.callTool('search_deals', {
            query: message,
            limit: 3
        });
        
        if (response.results > 0) {
            return this.formatDealsResponse(response, 'I found some deals related to your query:');
        } else {
            return "I couldn't find any deals matching your request. Try asking for specific products like 'gaming laptops' or 'wireless headphones', or ask for 'top deals' to see what's trending.";
        }
    }
    
    formatDealsResponse(response, header) {
        if (!response.deals || response.deals.length === 0) {
            return "I couldn't find any deals matching your criteria. Try adjusting your search terms or price range.";
        }
        
        let html = `<div class="font-semibold mb-3">${header}</div>`;
        
        response.deals.forEach((deal, index) => {
            const discount = deal.discountPercentage ? ` (${deal.discountPercentage}% off)` : '';
            const rating = deal.rating ? ` ⭐ ${deal.rating}/5` : '';
            const verified = deal.verified ? ' ✅' : '';
            
            html += `
                <div class="deal-card mb-3">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-semibold text-lg leading-tight">${deal.title}</h3>
                        <span class="text-xl font-bold">$${deal.price}</span>
                    </div>
                    ${deal.originalPrice ? `<div class="text-sm opacity-75 mb-2">Was: $${deal.originalPrice}${discount}</div>` : ''}
                    <div class="flex justify-between items-center text-sm">
                        <span>🏪 ${deal.store}${verified}</span>
                        <span>${rating}</span>
                    </div>
                    <div class="mt-2">
                        <a href="${deal.url}" target="_blank" class="inline-block bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm">
                            View Deal →
                        </a>
                    </div>
                </div>
            `;
        });
        
        return html;
    }
    
    formatComparisonResponse(response) {
        if (!response.best_deal) {
            return "I couldn't find any deals to compare.";
        }
        
        const deal = response.best_deal;
        const discount = deal.discountPercentage ? ` (${deal.discountPercentage}% off)` : '';
        
        return `
            <div class="font-semibold mb-3">🏆 Best Deal Found:</div>
            <div class="deal-card">
                <h3 class="font-semibold text-lg mb-2">${deal.title}</h3>
                <div class="text-2xl font-bold mb-2">$${deal.price}</div>
                ${deal.originalPrice ? `<div class="text-sm opacity-75 mb-2">Was: $${deal.originalPrice}${discount}</div>` : ''}
                <div class="flex justify-between items-center text-sm mb-3">
                    <span>🏪 ${deal.store}</span>
                    <span>⭐ ${deal.rating}/5</span>
                </div>
                <a href="${deal.url}" target="_blank" class="inline-block bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded">
                    Get This Deal →
                </a>
            </div>
            <div class="mt-3 text-sm text-gray-600">
                ${response.analysis}
            </div>
        `;
    }
    
    getHelpMessage() {
        return `
            <div class="space-y-3">
                <div class="font-semibold">I can help you find great deals! Here's what you can ask:</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div class="bg-blue-50 p-3 rounded">
                        <div class="font-medium text-blue-800">🔍 Search for deals:</div>
                        <div class="text-gray-600 mt-1">"Find gaming laptops under $1000"</div>
                    </div>
                    <div class="bg-green-50 p-3 rounded">
                        <div class="font-medium text-green-800">🔥 Get top deals:</div>
                        <div class="text-gray-600 mt-1">"Show me top electronics deals"</div>
                    </div>
                    <div class="bg-purple-50 p-3 rounded">
                        <div class="font-medium text-purple-800">⚖️ Compare options:</div>
                        <div class="text-gray-600 mt-1">"Compare iPhone 15 prices"</div>
                    </div>
                    <div class="bg-orange-50 p-3 rounded">
                        <div class="font-medium text-orange-800">🎯 Specific filters:</div>
                        <div class="text-gray-600 mt-1">"Wireless headphones with 4+ stars"</div>
                    </div>
                </div>
                <div class="text-sm text-gray-600 mt-3">
                    I search across multiple sources including Slickdeals, Amazon, Best Buy, and more!
                </div>
            </div>
        `;
    }
    
    addMessage(content, sender, type = 'normal') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-bubble ${sender === 'user' ? 'ml-auto max-w-xs' : 'max-w-2xl'}`;
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="bg-blue-500 text-white p-3 rounded-lg">
                    <div class="flex items-start space-x-2">
                        <i class="fas fa-user mt-1"></i>
                        <div>${this.escapeHtml(content)}</div>
                    </div>
                </div>
            `;
        } else {
            const bgColor = type === 'error' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200';
            const iconColor = type === 'error' ? 'text-red-500' : 'text-blue-500';
            
            messageDiv.innerHTML = `
                <div class="${bgColor} border p-4 rounded-lg">
                    <div class="flex items-start space-x-3">
                        <i class="fas fa-robot ${iconColor} text-xl mt-1"></i>
                        <div class="flex-1">${content}</div>
                    </div>
                </div>
            `;
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <i class="fas fa-robot text-gray-400 mr-3"></i>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <span class="ml-2 text-gray-500 text-sm">Finding deals...</span>
        `;
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isTyping = false;
    }
    
    clearChat() {
        // Keep only the welcome message
        const messages = this.chatMessages.children;
        for (let i = messages.length - 1; i > 0; i--) {
            messages[i].remove();
        }
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    focusInput() {
        this.userInput.focus();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Mock MCP Client for demonstration
class MockMCPClient {
    constructor() {
        this.mockDeals = [
            {
                id: "deal_001",
                title: "ASUS ROG Strix G15 Gaming Laptop - RTX 3060, Ryzen 7",
                price: 899.99,
                originalPrice: 1299.99,
                discountPercentage: 31,
                rating: 4.5,
                reviewCount: 1247,
                category: "electronics",
                store: "Best Buy",
                url: "https://bestbuy.com/deal/gaming-laptop",
                source: "slickdeals",
                verified: true,
                popularity: 95
            },
            {
                id: "deal_002",
                title: "Sony WH-1000XM4 Wireless Noise Canceling Headphones",
                price: 199.99,
                originalPrice: 349.99,
                discountPercentage: 43,
                rating: 4.8,
                reviewCount: 3421,
                category: "electronics",
                store: "Amazon",
                url: "https://amazon.com/sony-headphones",
                source: "rapidapi",
                verified: true,
                popularity: 88
            },
            {
                id: "deal_003",
                title: "Apple iPhone 15 Pro 128GB",
                price: 899.99,
                originalPrice: 999.99,
                discountPercentage: 10,
                rating: 4.7,
                reviewCount: 892,
                category: "electronics",
                store: "Target",
                url: "https://target.com/iphone-15",
                source: "dealnews",
                verified: true,
                popularity: 92
            },
            {
                id: "deal_004",
                title: "Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Qt",
                price: 49.99,
                originalPrice: 99.99,
                discountPercentage: 50,
                rating: 4.6,
                reviewCount: 8934,
                category: "home-garden",
                store: "Target",
                url: "https://target.com/instant-pot",
                source: "dealnews",
                verified: false,
                popularity: 72
            },
            {
                id: "deal_005",
                title: "Nintendo Switch OLED Console",
                price: 329.99,
                originalPrice: 349.99,
                discountPercentage: 6,
                rating: 4.8,
                reviewCount: 2156,
                category: "electronics",
                store: "GameStop",
                url: "https://gamestop.com/nintendo-switch",
                source: "slickdeals",
                verified: true,
                popularity: 85
            }
        ];
    }
    
    async callTool(toolName, params) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
        
        switch (toolName) {
            case 'search_deals':
                return this.searchDeals(params);
            case 'get_top_deals':
                return this.getTopDeals(params);
            case 'compare_deals':
                return this.compareDeals(params);
            case 'get_available_sources':
                return { success: true, sources: ['slickdeals', 'rapidapi', 'dealnews', 'retailmenot'] };
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }
    
    searchDeals(params) {
        let results = [...this.mockDeals];
        
        // Apply filters
        if (params.query) {
            const query = params.query.toLowerCase();
            results = results.filter(deal => 
                deal.title.toLowerCase().includes(query) ||
                deal.category.toLowerCase().includes(query)
            );
        }
        
        if (params.category) {
            results = results.filter(deal => deal.category === params.category);
        }
        
        if (params.maxPrice) {
            results = results.filter(deal => deal.price <= params.maxPrice);
        }
        
        if (params.minPrice) {
            results = results.filter(deal => deal.price >= params.minPrice);
        }
        
        // Sort by popularity
        results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        
        return {
            success: true,
            results: results.length,
            deals: results.slice(0, params.limit || 10)
        };
    }
    
    getTopDeals(params) {
        let results = [...this.mockDeals];
        
        if (params.category) {
            results = results.filter(deal => deal.category === params.category);
        }
        
        results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        
        return {
            success: true,
            results: results.length,
            deals: results.slice(0, params.limit || 10)
        };
    }
    
    compareDeals(params) {
        const deals = params.deals || this.mockDeals;
        
        if (deals.length === 0) {
            return { success: false };
        }
        
        // Find best deal based on discount percentage and rating
        const bestDeal = deals.reduce((best, current) => {
            if (!best) return current;
            
            const currentScore = (current.discountPercentage || 0) * 0.7 + (current.rating || 0) * 0.3;
            const bestScore = (best.discountPercentage || 0) * 0.7 + (best.rating || 0) * 0.3;
            
            return currentScore > bestScore ? current : best;
        }, null);
        
        return {
            success: true,
            best_deal: bestDeal,
            analysis: `Analyzed ${deals.length} deals based on discount percentage and customer ratings.`
        };
    }
}

// Initialize the chat UI when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BargainerChatUI();
});
